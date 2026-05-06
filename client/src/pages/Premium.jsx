import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { planAPI, paymentAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Premium = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { updateUser } = useAuth()
  const { company, role } = location.state || {}
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingPlanId, setProcessingPlanId] = useState('')

  useEffect(() => {
    let mounted = true

    const loadPlans = async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await planAPI.getPlans()
        if (!mounted) return
        setPlans(Array.isArray(data?.plans) ? data.plans : [])
      } catch (err) {
        if (!mounted) return
        setError(err.response?.data?.message || 'Failed to load premium plans. Please try again.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadPlans()

    return () => {
      mounted = false
    }
  }, [])

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const handleUpgrade = async (plan) => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!key) {
      toast.error('Razorpay key is missing. Set VITE_RAZORPAY_KEY_ID in client .env.')
      return
    }

    try {
      setProcessingPlanId(plan.planId)

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay checkout script')
      }

      const { data } = await paymentAPI.createOrder({ planId: plan.planId })
      const order = data?.order
      const transactionId = data?.transactionId

      if (!order?.id) {
        throw new Error('Order was not created')
      }

      const options = {
        key: data.keyId || key,
        amount: order.amount,
        currency: order.currency,
        name: 'MockMate Pro',
        description: `${plan.name} plan`,
        order_id: order.id,
        prefill: {
          name: JSON.parse(localStorage.getItem('mm_user') || '{}')?.name || '',
          email: JSON.parse(localStorage.getItem('mm_user') || '{}')?.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async (response) => {
          try {
            console.log('🔍 Razorpay Response received:', response)
            
            // Validate response has required fields
            if (!response?.razorpay_order_id || !response?.razorpay_payment_id || !response?.razorpay_signature) {
              console.error('❌ Missing required fields in response:', response)
              toast.error('Payment response incomplete. Missing payment ID or signature.')
              return
            }

            console.log('📤 Calling verifyPayment with:', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.planId,
            })
            
            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.planId,
            })

            console.log('✅ Verify Response:', verifyRes?.data)

            if (verifyRes?.data?.success) {
              // Update user context with premium status
              if (verifyRes.data?.user) {
                console.log('📝 Updating user context:', verifyRes.data.user)
                updateUser(verifyRes.data.user)
              }
              
              toast.success(`${plan.name} purchased successfully! 🎉`)
              
              // Redirect to History to see the successful transaction
              setTimeout(() => {
                navigate('/history', { state: { tab: 'transactions' } })
              }, 1500)
            } else {
              console.error('❌ Verification returned success: false', verifyRes?.data)
              toast.error('Payment verification failed. Please check your transaction history.')
            }
          } catch (verifyErr) {
            console.error('❌ Payment verification error:', {
              message: verifyErr?.message,
              response: verifyErr?.response?.data,
              status: verifyErr?.response?.status,
              fullError: verifyErr
            })
            toast.error(verifyErr?.response?.data?.message || 'Payment verification failed. Check transaction history.')
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              if (transactionId) {
                await paymentAPI.cancelTransaction(transactionId)
              }
              toast('Payment cancelled')
            } catch (err) {
              console.error('Error cancelling transaction:', err)
              toast('Payment cancelled')
            }
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      
      razorpay.on('payment.failed', (response) => {
        console.error('❌ Payment failed event triggered:', response)
        toast.error(response?.error?.description || 'Payment failed. Please try again.')
      })
      
      razorpay.on('payment.success', (response) => {
        console.log('✅ Payment success event triggered:', response)
        // This shouldn't normally fire, the handler callback should be used instead
      })

      console.log('🎯 Opening Razorpay modal...')
      razorpay.open()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to start payment')
    } finally {
      setProcessingPlanId('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </button>

        {/* Context banner — show if arrived from a company card */}
        {company && role && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4m0 4h.01"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-800">
                You're scheduling: <span className="text-indigo-600">{role}</span> at <span className="text-indigo-600">{company}</span>
              </p>
              <p className="text-xs text-indigo-500 mt-0.5">
                Upgrade to Premium to unlock this scheduled interview session.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            ⭐ MockMate Premium
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unlock Your Interview Potential</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Get company-targeted AI questions, schedule mock interviews, and land your dream job faster.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {loading ? (
            <div className="md:col-span-3 text-center py-10 text-sm text-gray-500">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="md:col-span-3 text-center py-10 text-sm text-gray-500">No premium plans available.</div>
          ) : plans.map(plan => (
            <div
              key={plan.planId}
              className={`relative bg-white rounded-2xl border p-6 flex flex-col transition-all
                ${plan.highlight
                  ? 'border-indigo-400 shadow-lg shadow-indigo-100 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap
                  ${plan.highlight
                    ? 'bg-indigo-600 text-white'
                    : 'bg-amber-400 text-amber-900'}`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-900 mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="flex-shrink-0 text-emerald-500 mt-0.5" width="15" height="15"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={processingPlanId === plan.planId}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${plan.highlight
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-indigo-50 hover:text-indigo-700'}`}
              >
                {processingPlanId === plan.planId ? 'Processing...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          {['🔒 Secure payments via Razorpay', '↩️ 7-day money-back guarantee', '⚡ Instant activation', '🎯 Cancel anytime'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Premium