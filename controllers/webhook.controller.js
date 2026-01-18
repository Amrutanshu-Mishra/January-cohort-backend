import { Webhook } from 'svix';
import User from '../models/User.js';
import Company from '../models/Company.js';

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
               const { id, email_addresses, first_name, last_name, username, public_metadata } = evt.data;

               const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)?.email_address;

               // Check if this user has already chosen a role (from publicMetadata)
               const role = public_metadata?.role || 'user';

               // If role is 'company', don't create a User document
               // The company registration endpoint will create the Company document
               if (role === 'company') {
                    console.log('User registered as company, skipping User creation. Company will be created during registration.');
                    return res.status(200).json({ received: true });
               }

               // Check if user already exists (prevent duplicates)
               const existingUser = await User.findOne({ clerkId: id });
               if (existingUser) {
                    console.log('User already exists, skipping creation:', primaryEmail);
                    return res.status(200).json({ received: true });
               }

               // Create user in database
               const user = await User.create({
                    clerkId: id,
                    email: primaryEmail,
                    fullName: `${first_name || ''} ${last_name || ''}`.trim(),
                    username: username || '',
                    role: 'user'
               });

               console.log('User created via webhook:', user.email);
          }

          if (eventType === 'user.updated') {
               const { id, email_addresses, first_name, last_name, username, public_metadata } = evt.data;

               const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)?.email_address;
               const role = public_metadata?.role;

               // If role changed to 'company', we need to handle this differently
               if (role === 'company') {
                    // Update company if exists
                    const existingCompany = await Company.findOne({ clerkId: id });
                    if (existingCompany) {
                         await Company.findOneAndUpdate(
                              { clerkId: id },
                              { email: primaryEmail },
                              { upsert: false }
                         );
                         console.log('Company updated via webhook:', primaryEmail);
                    }
                    // Note: Don't delete the user document if it exists - they might switch back
               } else {
                    // Update or create user
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
          }

          if (eventType === 'user.deleted') {
               const { id } = evt.data;

               // Delete from both collections (in case they exist in either)
               const userDeleted = await User.findOneAndDelete({ clerkId: id });
               const companyDeleted = await Company.findOneAndDelete({ clerkId: id });

               if (userDeleted) {
                    console.log('User deleted via webhook:', id);
               }
               if (companyDeleted) {
                    console.log('Company deleted via webhook:', id);
               }
          }

          res.status(200).json({ received: true });
     } catch (error) {
          console.error('Error processing webhook:', error);
          res.status(500).json({ error: 'Error processing webhook' });
     }
};
