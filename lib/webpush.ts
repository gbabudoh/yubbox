import webpush from 'web-push';

function initVapid() {
  const pub  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT ?? 'mailto:admin@yubbox.com';
  if (pub && priv) {
    webpush.setVapidDetails(subj, pub, priv);
  }
}

export interface PushPayload {
  title: string;
  body:  string;
  url?:  string;
  icon?: string;
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
) {
  initVapid();
  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys:     { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify({ ...payload, icon: payload.icon ?? '/icon.png' }),
  );
}
