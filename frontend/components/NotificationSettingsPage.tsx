"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getPreferences, updatePreferences } from "@/lib/api/notifications";
import { NotificationPreferences } from "@/types";
import { HiEnvelope, HiDevicePhoneMobile } from "react-icons/hi2";

interface PreferenceRowProps {
	label: string;
	description: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
}

function PreferenceRow({
	label,
	description,
	checked,
	onCheckedChange,
	disabled,
}: PreferenceRowProps) {
	return (
		<div className="flex items-center justify-between gap-4 py-4">
			<div className="flex-1 min-w-0">
				<p className="text-foreground text-sm font-medium">{label}</p>
				<p className="text-muted-foreground text-sm mt-0.5">{description}</p>
			</div>
			<Switch
				checked={checked}
				onCheckedChange={onCheckedChange}
				disabled={disabled}
			/>
		</div>
	);
}

export default function NotificationSettingsPage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
	const [localPrefs, setLocalPrefs] = useState<Partial<NotificationPreferences>>({});

	useEffect(() => {
		fetchPreferences();
	}, []);

	const fetchPreferences = async () => {
		setLoading(true);
		try {
			const prefs = await getPreferences();
			setPreferences(prefs);
			setLocalPrefs(prefs);
		} catch (error) {
			console.error("Failed to fetch preferences:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		setSaved(false);
		try {
			const updated = await updatePreferences(localPrefs);
			setPreferences(updated);
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (error) {
			console.error("Failed to save preferences:", error);
		} finally {
			setSaving(false);
		}
	};

	const updateLocalPref = (key: keyof NotificationPreferences, value: boolean) => {
		setLocalPrefs((prev) => ({ ...prev, [key]: value }));
	};

	const hasChanges = preferences && JSON.stringify(localPrefs) !== JSON.stringify(preferences);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
			</div>
		);
	}

	return (
		<div>
			<div className="mb-8">
				<h2 className="text-foreground text-xl font-semibold tracking-tight">
					Notification Preferences
				</h2>
				<p className="text-muted-foreground text-sm mt-2">
					Choose how you want to be notified about activity on your ideas.
				</p>
			</div>

			{/* Email Notifications Section */}
			<div className="mb-10">
				<div className="flex items-center gap-3 mb-4">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
						<HiEnvelope className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<h3 className="text-foreground text-sm font-semibold">
							Email Notifications
						</h3>
						<p className="text-muted-foreground text-xs">
							Receive emails for important updates
						</p>
					</div>
				</div>
				<div className="divide-border divide-y border-border/60 border rounded-lg px-4 bg-card">
					<PreferenceRow
						label="First Feedback"
						description="When you receive the first comment or signal on an idea"
						checked={localPrefs.emailFirstFeedback ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("emailFirstFeedback", checked)
						}
					/>
					<PreferenceRow
						label="Daily Summary"
						description="A daily digest of upvotes, feedback, and waitlist signups"
						checked={localPrefs.emailDailySummary ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("emailDailySummary", checked)
						}
					/>
					<PreferenceRow
						label="Validation Signals"
						description="When someone adds a validation signal to your idea"
						checked={localPrefs.emailSignals ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("emailSignals", checked)
						}
					/>
					<PreferenceRow
						label="Comments"
						description="When someone comments on your idea"
						checked={localPrefs.emailComments ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("emailComments", checked)
						}
					/>
					<PreferenceRow
						label="Replies"
						description="When someone replies to your comment"
						checked={localPrefs.emailReplies ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("emailReplies", checked)
						}
					/>
					<PreferenceRow
						label="Milestones"
						description="When your idea reaches upvote milestones"
						checked={localPrefs.emailMilestones ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("emailMilestones", checked)
						}
					/>
				</div>
			</div>

			{/* In-App Notifications Section */}
			<div className="mb-10">
				<div className="flex items-center gap-3 mb-4">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
						<HiDevicePhoneMobile className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<h3 className="text-foreground text-sm font-semibold">
							In-App Notifications
						</h3>
						<p className="text-muted-foreground text-xs">
							Show notifications in your notification bell.
						</p>
					</div>
				</div>
				<div className="divide-border divide-y border-border/60 border rounded-lg px-4 bg-card">
					<PreferenceRow
						label="Upvotes"
						description="When someone upvotes your idea"
						checked={localPrefs.inAppUpVotes ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("inAppUpVotes", checked)
						}
					/>
					<PreferenceRow
						label="Validation Signals"
						description="When someone adds a validation signal"
						checked={localPrefs.inAppUpSignals ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("inAppUpSignals", checked)
						}
					/>
					<PreferenceRow
						label="Comments"
						description="When someone comments on your idea"
						checked={localPrefs.inAppUpComments ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("inAppUpComments", checked)
						}
					/>
					<PreferenceRow
						label="Replies"
						description="When someone replies to your comment"
						checked={localPrefs.inAppUpReplies ?? true}
						onCheckedChange={(checked) =>
							updateLocalPref("inAppUpReplies", checked)
						}
					/>
				</div>
			</div>

			{/* Save Button */}
			<div className="flex items-center gap-4 pt-2">
				<Button
					onClick={handleSave}
					disabled={saving || !hasChanges}
					className="cursor-pointer"
				>
					{saving ? "Saving..." : "Save preferences"}
				</Button>
				{saved && (
					<span className="text-sm text-emerald-600 dark:text-emerald-400">
						Preferences saved!
					</span>
				)}
			</div>
		</div>
	);
}
