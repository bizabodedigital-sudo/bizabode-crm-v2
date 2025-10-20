import { FeedbackForm } from "@/components/feedback/feedback-form"

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Customer Feedback
            </h1>
            <p className="text-lg text-muted-foreground">
              We value your feedback and are committed to providing excellent service.
            </p>
          </div>
          
          <FeedbackForm />
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Your feedback helps us improve our products and services. 
              We typically respond within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
