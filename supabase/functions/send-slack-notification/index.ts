import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, webhook_url, bot_token, email, payload } = await req.json()

    if (type === 'webhook') {
      if (!webhook_url || !payload) {
        return new Response(
          JSON.stringify({ error: 'Missing webhook_url or payload' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          },
        )
      }

      const response = await fetch(webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Slack API error (Webhook): ${response.status} ${errorText}`,
        )
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    } else if (type === 'dm') {
      if (!bot_token || !email || !payload) {
        return new Response(
          JSON.stringify({ error: 'Missing bot_token, email, or payload' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          },
        )
      }

      const lookupResponse = await fetch(
        `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(
          email,
        )}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${bot_token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )

      const lookupData = await lookupResponse.json()

      if (!lookupData.ok) {
        throw new Error(`Slack API error (Lookup): ${lookupData.error}`)
      }

      const userId = lookupData.user.id

      const messageResponse = await fetch(
        'https://slack.com/api/chat.postMessage',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${bot_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: userId,
            text: payload.text,
          }),
        },
      )

      const messageData = await messageResponse.json()
      if (!messageData.ok) {
        throw new Error(`Slack API error (Post Message): ${messageData.error}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Use "webhook" or "dm"' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        },
      )
    }
  } catch (error: any) {
    console.error('Slack Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
