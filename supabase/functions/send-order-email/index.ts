// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createTransport } from "npm:nodemailer@6.9.7"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { orderId, clientName, total } = await req.json()

        // Create a transporter using Gmail SMTP
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: 'wangprine1019@gmail.com',
                pass: 'russ pycr kdzw czia', // App Password provided by user
            },
        })

        const mailOptions = {
            from: 'wangprine1019@gmail.com',
            to: 'information.xinya@gmail.com',
            subject: `New Order: ${orderId}`,
            text: `
        New Order Received!
        
        Order ID: ${orderId}
        Client: ${clientName}
        Total: $${total}
        
        Please check the admin dashboard for details.
      `,
        }

        await transporter.sendMail(mailOptions)

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        // Return 200 even on error so the client can read the error message
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    }
})
