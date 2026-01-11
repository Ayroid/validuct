export const waitlistEmail = () => ({
  from: `Validuct <hello@validuct.com>`,
  subject: `You're on the Validuct Waitlist! 🎉`,
  html: `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<title>You're on the Validuct Waitlist!</title>
		<style type="text/css">
			/* Reset styles */
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

			/* Mobile styles */
			@media only screen and (max-width: 600px) {
				.email-container {
					width: 100% !important;
					max-width: 100% !important;
				}
								.mobile-padding {
					padding-left: 16px !important;
					padding-right: 16px !important;
				}
				.tagline-cell {
					display: block !important;
					width: 100% !important;
					padding: 6px 0 !important;
				}
				.main-heading {
					font-size: 28px !important;
				}
				.sub-heading {
					font-size: 15px !important;
				}
			}
		</style>
	</head>
	<body
		style="
			margin: 0;
			padding: 0;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
				'Helvetica Neue', Arial, sans-serif;
			background-color: #f8f6f3;
		"
	>
		<!-- Warm cream background matching bg-background -->
		<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f6f3;">
			<tr>
				<td align="center" style="padding: 40px 16px">
					<table
						role="presentation"
						class="email-container"
						style="max-width: 600px; width: 100%; border-collapse: collapse"
					>
						<!-- Logo Section -->
						<tr>
							<td align="center" style="padding-bottom: 32px">
								<img
									src="https://validuct.com/logo.png"
									alt="Validuct"
									width="80"
									height="70"
									style="display: block; margin: 0 auto"
								/>
							</td>
						</tr>

						<!-- Hero Section - Matching landing page hero -->
						<tr>
							<td
								class="mobile-padding"
								style="padding: 0 0 40px 0; text-align: center"
							>
								<h1
									class="main-heading"
									style="
										margin: 0 0 16px 0;
										font-size: 36px;
										font-weight: 700;
										color: #3d3528;
									"
								>
									You're on the Waitlist!
								</h1>
								<p class="sub-heading" style="margin: 0 0 24px 0; font-size: 18px; color: #7a7265; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;">
									Get ready to share your product ideas, get honest feedback from builders, and track your journey from concept to launch.
								</p>

								<!-- CTA Button - Brand orange gradient -->
								<table role="presentation" style="margin: 0 auto 12px auto;">
									<tr>
										<td
											style="
												background-color: #ffbd59;
												border-radius: 8px;
												padding: 14px 40px;
											"
										>
											<a
												href="https://validuct.com"
												style="
													font-size: 16px;
													font-weight: 600;
													color: #000000;
													text-decoration: none;
												"
											>
												Visit Validuct
											</a>
										</td>
									</tr>
								</table>
								<p style="margin: 0; font-size: 13px; color: #a39e94;">
									We'll notify you when it's your turn
								</p>

								<!-- Tagline Pills - Matching landing page -->
								<table
									role="presentation"
									style="width: 100%; border-collapse: collapse; margin-top: 32px;"
								>
									<tr>
										<td
											class="tagline-cell"
											align="center"
											style="
												font-size: 14px;
												font-weight: 500;
												color: #5a5347;
												padding: 8px 12px;
											"
										>
											<span style="display: inline-block; width: 8px; height: 8px; background-color: #ffbd59; border-radius: 50%; vertical-align: middle; margin-right: 8px;"></span>
											<span style="vertical-align: middle">Demand Signals</span>
										</td>
										<td
											class="tagline-cell"
											align="center"
											style="
												font-size: 14px;
												font-weight: 500;
												color: #5a5347;
												padding: 8px 12px;
											"
										>
											<span style="display: inline-block; width: 8px; height: 8px; background-color: #ff914d; border-radius: 50%; vertical-align: middle; margin-right: 8px;"></span>
											<span style="vertical-align: middle">Builder Feedback</span>
										</td>
										<td
											class="tagline-cell"
											align="center"
											style="
												font-size: 14px;
												font-weight: 500;
												color: #5a5347;
												padding: 8px 12px;
											"
										>
											<span style="display: inline-block; width: 8px; height: 8px; background-color: #ffde59; border-radius: 50%; vertical-align: middle; margin-right: 8px;"></span>
											<span style="vertical-align: middle">Journey Tracking</span>
										</td>
									</tr>
								</table>
							</td>
						</tr>

						<!-- Feature Cards Section - Matching landing page cards -->
						<!-- What's Live Card -->
						<tr>
							<td class="mobile-padding" style="padding: 0 0 16px 0;">
								<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffbd59; border-radius: 12px;">
									<tr>
										<td style="padding: 24px;">
											<h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #000000;">
												What's live now
											</h3>
											<p style="margin: 0 0 16px 0; font-size: 13px; color: #000000;">
												Start validating your ideas with these features.
											</p>
											<!-- Feature Items - White card inside -->
											<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px;">
												<tr>
													<td style="padding: 12px;">
														<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f3f0; border-radius: 6px; margin-bottom: 8px;">
															<tr>
																<td style="padding: 8px 12px; font-size: 12px; font-weight: 500; color: #000000;">Validation signals: Would Pay & more</td>
																<td style="padding: 8px 12px; text-align: right; color: #ffbd59; font-weight: 700;">&#10003;</td>
															</tr>
														</table>
														<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f3f0; border-radius: 6px; margin-bottom: 8px;">
															<tr>
																<td style="padding: 8px 12px; font-size: 12px; font-weight: 500; color: #000000;">Category-based nested comments</td>
																<td style="padding: 8px 12px; text-align: right; color: #ffbd59; font-weight: 700;">&#10003;</td>
															</tr>
														</table>
														<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f3f0; border-radius: 6px;">
															<tr>
																<td style="padding: 8px 12px; font-size: 12px; font-weight: 500; color: #000000;">Builder profiles & summaries</td>
																<td style="padding: 8px 12px; text-align: right; color: #ffbd59; font-weight: 700;">&#10003;</td>
															</tr>
														</table>
													</td>
												</tr>
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>

						<!-- Coming Soon Card -->
						<tr>
							<td class="mobile-padding" style="padding: 0 0 40px 0;">
								<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f3f0; border-radius: 12px;">
									<tr>
										<td style="padding: 24px;">
											<h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #3d3528;">
												Coming soon
											</h3>
											<p style="margin: 0 0 16px 0; font-size: 13px; color: #7a7265;">
												Powerful features to supercharge validation.
											</p>
											<!-- Coming Soon Items - White card inside -->
											<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px;">
												<tr>
													<td style="padding: 12px;">
														<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f3f0; border-radius: 6px; margin-bottom: 8px;">
															<tr>
																<td style="padding: 8px 12px; font-size: 12px; font-weight: 500; color: #5a5347;">AI competitor & market analysis</td>
																<td style="padding: 8px 12px; text-align: right; color: #ff914d; font-weight: 600; font-size: 10px;">Soon</td>
															</tr>
														</table>
														<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f3f0; border-radius: 6px; margin-bottom: 8px;">
															<tr>
																<td style="padding: 8px 12px; font-size: 12px; font-weight: 500; color: #5a5347;">Waitlist collection for ideas</td>
																<td style="padding: 8px 12px; text-align: right; color: #ff914d; font-weight: 600; font-size: 10px;">Soon</td>
															</tr>
														</table>
														<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f3f0; border-radius: 6px;">
															<tr>
																<td style="padding: 8px 12px; font-size: 12px; font-weight: 500; color: #5a5347;">Validation analytics dashboard</td>
																<td style="padding: 8px 12px; text-align: right; color: #ff914d; font-weight: 600; font-size: 10px;">Soon</td>
															</tr>
														</table>
													</td>
												</tr>
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>

						<!-- Quote Section -->
						<tr>
							<td class="mobile-padding" style="padding: 0 0 32px 0; text-align: center">
								<p
									style="
										margin: 0;
										font-size: 20px;
										font-weight: 600;
										color: #3d3528;
										font-style: italic;
									"
								>
									"Stop guessing. Start Validating."
								</p>
							</td>
						</tr>

						<!-- Footer -->
						<tr>
							<td
								class="mobile-padding"
								style="
									padding: 24px 0;
									text-align: center;
									border-top: 1px solid #e8e4dd;
								"
							>
								<p
									style="
										margin: 0 0 4px 0;
										font-size: 14px;
										font-weight: 600;
										color: #3d3528;
									"
								>
									Validuct
								</p>
								<p style="margin: 0 0 12px 0; font-size: 13px; color: #7a7265">
									The Idea Validation Platform for Builders
								</p>
								<p style="margin: 0; font-size: 12px; color: #a39e94">
									&copy; 2026 Validuct | Built by <a href="https://ayroid.in" style="color: #ff914d; text-decoration: none; font-weight: 500;">Ayroid</a>
								</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`,
});
