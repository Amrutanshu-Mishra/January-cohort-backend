import { Webhook } from 'svix';
import User from '../models/User.js';

// Clerk Webhook Handler - automatically syncs users when they sign up
export const handleClerkWebhook = async (req, res) => {
     const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

     if (!WEBHOOK_SECRET) {
          console.error('Missing CLERK_WEBHOOK_SECRET');
          return res.status(500).json({ error: 'Server configuration error' });
     }

     // Get the headers
     const svix_id = req.headers['svix-id'];
     const svix_timestamp = req.headers['svix-timestamp'];
     const svix_signature = req.headers['svix-signature'];

     // If there are no headers, error out
     if (!svix_id || !svix_timestamp || !svix_signature) {
          return res.status(400).json({ error: 'Missing svix headers' });
     }

     // Get the body - req.body is a Buffer when using express.raw()
     const body = req.body.toString('utf8');

     // Create a new Svix instance with your secret
     const wh = new Webhook(WEBHOOK_SECRET);

     let evt;

     // Verify the payload with the headers
     try {
          evt = wh.verify(body, {
               'svix-id': svix_id,
               'svix-timestamp': svix_timestamp,
               'svix-signature': svix_signature,
          });
     } catch (err) {
          console.error('Webhook verification failed:', err.message);
          return res.status(400).json({ error: 'Webhook verification failed' });
     }

     // Handle the webhook
     const eventType = evt.type;
     console.log(`Received Clerk webhook: ${eventType}`);

     try {
          if (eventType === 'user.created') {
               const { id, email_addresses, first_name, last_name, username } = evt.data;

               const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)?.email_address;

               // Create user in database
               const user = await User.create({
                    clerkId: id,
                    email: primaryEmail,
                    fullName: `${first_name || ''} ${last_name || ''}`.trim(),
                    username: username || ''
               });

               console.log('User created via webhook:', user.email);
          }

          if (eventType === 'user.updated') {
               const { id, email_addresses, first_name, last_name, username } = evt.data;

               const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)?.email_address;

               await User.findOneAndUpdate(
                    { clerkId: id },
                    {
                         email: primaryEmail,
                         fullName: `${first_name || ''} ${last_name || ''}`.trim(),
                         username: username || ''
                    },
                    { upsert: true }
               );

               console.log('User updated via webhook:', primaryEmail);
          }

          if (eventType === 'user.deleted') {
               const { id } = evt.data;

               await User.findOneAndDelete({ clerkId: id });
               console.log('User deleted via webhook:', id);
          }

          res.status(200).json({ received: true });
     } catch (error) {
          console.error('Error processing webhook:', error);
          res.status(500).json({ error: 'Error processing webhook' });
     }
};
