import { createClient } from '@/services/supabase/client'

export interface VerificationRequestData {
  institutionName: string
  institutionEmail: string
  orcidId?: string
  documentsUrl?: string
}

export async function submitVerificationRequest(data: VerificationRequestData) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await sb.from('verification_requests').insert({
      user_id: user.id,
      institution_name: data.institutionName,
      institution_email: data.institutionEmail,
      orcid_id: data.orcidId || null,
      documents_url: data.documentsUrl || null,
      status: 'pending'
    })

    if (error) {
      console.error('Failed to submit verification request:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
