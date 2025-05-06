import { env } from '@/data/env/server'
import { deleteUser, insertUser, updateUser } from '@/features/users/db/users'
import { syncClerkUserMetadata } from '@/services/clerk'
import { WebhookEvent } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'

async function validateRequest(request: Request) {
  const payloadString = await request.text()
  const headerPayload = await headers()

  const svixId = headerPayload.get('svix-id')
  const svixSignature = headerPayload.get('svix-signature')
  const svixTimestamp = headerPayload.get('svix-timestamp')

  if (!svixId || !svixSignature || !svixTimestamp) {
    throw new Error('Error occurred - no svix headers')
  }

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET)
  return wh.verify(payloadString, {
    'svix-id': svixId,
    'svix-signature': svixSignature,
    'svix-timestamp': svixTimestamp,
  }) as WebhookEvent
}

export async function POST(request: Request) {
  try {
    const event = await validateRequest(request)
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const email = event.data.email_addresses.find(
          (email) => email.id === event.data.primary_email_address_id
        )?.email_address
        const name = `${event.data.first_name} ${event.data.last_name}`.trim()
        if (email == null) return new Response('No email', { status: 400 })
        if (name === '') return new Response('No name', { status: 400 })

        if (event.type === 'user.created') {
          const user = await insertUser({
            clerkUserId: event.data.id,
            email,
            name,
            imageUrl: event.data.image_url,
            role: 'user',
          })

          await syncClerkUserMetadata(user)
        } else {
          await updateUser(
            { clerkUserId: event.data.id },
            {
              email,
              name,
              imageUrl: event.data.image_url,
              role: event.data.public_metadata.role,
            }
          )
        }
        break
      }
      case 'user.deleted': {
        if (event.data.id != null) {
          await deleteUser({ clerkUserId: event.data.id })
        }
        break
      }
    }
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response(`Error occurred - ${err}`, { status: 400 })
  }

  return new Response('OK', { status: 200 })
}
