import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFatigueAlert(params: {
  to: string;
  adName: string;
  daysToFatigue: number;
  fatigueState: "amber" | "red";
}) {
  const { to, adName, daysToFatigue, fatigueState } = params;

  const urgency = fatigueState === "red" ? "is fatiguing now" : "is about to fatigue";

  await resend.emails.send({
    from: "Reforge Alerts <alerts@yourdomain.com>", // update once your domain is verified in Resend
    to,
    subject: `⚠️ "${adName}" ${urgency}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>${adName} ${urgency}</h2>
        <p>Estimated <strong>${daysToFatigue} day(s)</strong> until this ad drops below break-even.</p>
        <p>Log in to Reforge to review it and queue a replacement.</p>
      </div>
    `,
  });
}
