interface NotificationEmailParams {
  type: 'signal' | 'comment' | 'reply' | 'milestone' | 'first_feedback' | 'daily_summary';
  ideaTitle?: string;
  signalType?: string;
  commentPreview?: string;
  triggeredByUsername?: string;
  milestoneCount?: number;
  actionUrl?: string;
  feedbackType?: 'comment' | 'signal';
  // Daily summary fields
  dailySummary?: {
    date: string;
    totalUpvotes: number;
    totalComments: number;
    totalWaitlist: number;
    ideas: Array<{
      heading: string;
      upvotes: number;
      comments: number;
      waitlist: number;
      url: string;
    }>;
  };
}

export const notificationEmailTemplate = (params: NotificationEmailParams): string => {
  const { type, ideaTitle, signalType, commentPreview, triggeredByUsername, milestoneCount, actionUrl, feedbackType, dailySummary } = params;

  let title = '';
  let subtitle = '';
  let emoji = '';
  let ctaText = 'View on Validuct';
  let customContent = '';

  switch (type) {
    case 'signal':
      title = `New "${signalType}" Signal`;
      subtitle = triggeredByUsername
        ? `@${triggeredByUsername} added a validation signal to your idea "${ideaTitle}"`
        : `Someone added a validation signal to your idea "${ideaTitle}"`;
      emoji = '🎯';
      break;
    case 'comment':
      title = 'New Comment';
      subtitle = triggeredByUsername
        ? `@${triggeredByUsername} commented on your idea "${ideaTitle}"`
        : `Someone commented on your idea "${ideaTitle}"`;
      emoji = '💬';
      break;
    case 'reply':
      title = 'New Reply';
      subtitle = triggeredByUsername
        ? `@${triggeredByUsername} replied to your comment on "${ideaTitle}"`
        : `Someone replied to your comment on "${ideaTitle}"`;
      emoji = '↩️';
      break;
    case 'milestone':
      title = `${milestoneCount} Upvotes Milestone!`;
      subtitle = `Your idea "${ideaTitle}" just reached ${milestoneCount} upvotes!`;
      emoji = '🎉';
      ctaText = 'Celebrate on Validuct';
      break;
    case 'first_feedback':
      title = 'Your First Feedback!';
      subtitle = feedbackType === 'comment'
        ? `@${triggeredByUsername || 'Someone'} left the first comment on "${ideaTitle}"`
        : `@${triggeredByUsername || 'Someone'} gave the first validation signal on "${ideaTitle}"`;
      emoji = '🎊';
      ctaText = 'See the Feedback';
      break;
    case 'daily_summary':
      title = 'Your Daily Summary';
      subtitle = `Here's what happened with your ideas on ${dailySummary?.date || 'today'}`;
      emoji = '📊';
      ctaText = 'View Dashboard';
      if (dailySummary) {
        customContent = `
        <!-- Summary Stats -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px; text-align: center; background-color: #f5f3f0; border-radius: 8px 0 0 8px;">
              <p style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #3d3528;">${dailySummary.totalUpvotes}</p>
              <p style="margin: 0; font-size: 12px; color: #7a7265;">Upvotes</p>
            </td>
            <td style="padding: 16px; text-align: center; background-color: #f5f3f0;">
              <p style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #3d3528;">${dailySummary.totalComments}</p>
              <p style="margin: 0; font-size: 12px; color: #7a7265;">Comments</p>
            </td>
            <td style="padding: 16px; text-align: center; background-color: #f5f3f0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #3d3528;">${dailySummary.totalWaitlist}</p>
              <p style="margin: 0; font-size: 12px; color: #7a7265;">Waitlist</p>
            </td>
          </tr>
        </table>

        <!-- Ideas Breakdown -->
        ${dailySummary.ideas.length > 0 ? `
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          ${dailySummary.ideas.map(idea => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e8e4dd;">
              <a href="${idea.url}" style="text-decoration: none;">
                <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #3d3528;">${idea.heading}</p>
                <p style="margin: 0; font-size: 12px; color: #7a7265;">
                  👍 ${idea.upvotes} upvotes · 💬 ${idea.comments} comments · 📋 ${idea.waitlist} waitlist
                </p>
              </a>
            </td>
          </tr>
          `).join('')}
        </table>
        ` : '<p style="margin: 0 0 24px 0; font-size: 14px; color: #7a7265; text-align: center;">No activity on your ideas today.</p>'}
        `;
      }
      break;
  }

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${title}</title>
    <style type="text/css">
      body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        -ms-interpolation-mode: bicubic;
      }
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          max-width: 100% !important;
        }
        .mobile-padding {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        .main-heading {
          font-size: 24px !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f6f3;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f6f3;">
      <tr>
        <td align="center" style="padding: 40px 16px">
          <table role="presentation" class="email-container" style="max-width: 600px; width: 100%; border-collapse: collapse">
            <!-- Logo Section -->
            <tr>
              <td align="center" style="padding-bottom: 32px">
                <img src="https://validuct.com/logo.png" alt="Validuct" width="60" height="60" style="display: block; margin: 0 auto" />
              </td>
            </tr>

            <!-- Main Content Card -->
            <tr>
              <td class="mobile-padding" style="padding: 0 0 32px 0;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <tr>
                    <td style="padding: 32px;">
                      <!-- Emoji -->
                      <p style="margin: 0 0 16px 0; font-size: 48px; text-align: center;">${emoji}</p>

                      <!-- Title -->
                      <h1 class="main-heading" style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700; color: #3d3528; text-align: center;">
                        ${title}
                      </h1>

                      <!-- Subtitle -->
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #7a7265; line-height: 1.6; text-align: center;">
                        ${subtitle}
                      </p>

                      ${commentPreview ? `
                      <!-- Comment Preview -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f3f0; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px; border-left: 4px solid #ffbd59;">
                            <p style="margin: 0; font-size: 14px; color: #5a5347; font-style: italic; line-height: 1.5;">
                              "${commentPreview}${commentPreview.length >= 150 ? '...' : ''}"
                            </p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      ${customContent}

                      <!-- CTA Button -->
                      <table role="presentation" style="margin: 0 auto;">
                        <tr>
                          <td style="background-color: #ffbd59; border-radius: 8px; padding: 14px 32px;">
                            <a href="${actionUrl || 'https://validuct.com'}" style="font-size: 16px; font-weight: 600; color: #000000; text-decoration: none;">
                              ${ctaText}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="mobile-padding" style="padding: 24px 0; text-align: center; border-top: 1px solid #e8e4dd;">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #3d3528;">
                  Validuct
                </p>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #7a7265">
                  The Idea Validation Platform for Builders
                </p>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #a39e94">
                  You're receiving this because you have notifications enabled.
                </p>
                <p style="margin: 0; font-size: 12px; color: #a39e94">
                  <a href="${process.env.APP_URL}/settings/notifications" style="color: #ff914d; text-decoration: none;">Manage preferences</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
