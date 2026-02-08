"use client";

import { useState, useEffect } from "react";
import { HiCog6Tooth } from "react-icons/hi2";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { getPreferences, updatePreferences } from "@/lib/api/notifications";
import { NotificationPreferences } from "@/types";

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
		<div className="flex items-center justify-between gap-4 py-3">
			<div className="min-w-0 flex-1">
				<p className="text-foreground text-sm font-medium">{label}</p>
				<p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
			</div>
			<Switch
				checked={checked}
				onCheckedChange={onCheckedChange}
				disabled={disabled}
				size="sm"
			/>
		</div>
	);
}

export default function NotificationSettingsDialog() {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [preferences, setPreferences] =
		useState<NotificationPreferences | null>(null);
	const [localPrefs, setLocalPrefs] = useState<
		Partial<NotificationPreferences>
	>({});

	useEffect(() => {
		if (open && !preferences) {
			fetchPreferences();
		}
	}, [open, preferences]);

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
		try {
			const updated = await updatePreferences(localPrefs);
			setPreferences(updated);
			setOpen(false);
		} catch (error) {
			console.error("Failed to save preferences:", error);
		} finally {
			setSaving(false);
		}
	};

	const updateLocalPref = (
		key: keyof NotificationPreferences,
		value: boolean
	) => {
		setLocalPrefs((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<button
					className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-lg p-2 transition-colors"
					title="Notification settings"
				>
					<HiCog6Tooth className="h-5 w-5" />
				</button>
			</AlertDialogTrigger>
			<AlertDialogContent className="mx-2 sm:min-w-xl md:mx-0">
				<AlertDialogHeader>
					<AlertDialogTitle>Notification Preferences</AlertDialogTitle>
					<AlertDialogDescription>
						Choose how you want to be notified about activity on your ideas.
					</AlertDialogDescription>
				</AlertDialogHeader>

				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
					</div>
				) : (
					<div className="-mx-6 max-h-[60vh] overflow-y-auto px-6">
						{/* Email Notifications Section */}
						<div className="mb-6">
							<h3 className="text-foreground mb-1 text-sm font-semibold">
								Email Notifications
							</h3>
							<p className="text-muted-foreground mb-3 text-xs">
								Receive emails for important updates
							</p>
							<div className="divide-border border-border divide-y rounded-lg border px-4">
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
						<div>
							<h3 className="text-foreground mb-1 text-sm font-semibold">
								In-App Notifications
							</h3>
							<p className="text-muted-foreground mb-3 text-xs">
								Show notifications in your notification bell
							</p>
							<div className="divide-border border-border divide-y rounded-lg border px-4">
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
					</div>
				)}

				<AlertDialogFooter className="mt-4">
					<AlertDialogCancel disabled={saving} className="cursor-pointer">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleSave}
						className="cursor-pointer"
						disabled={saving || loading}
					>
						{saving ? "Saving..." : "Save preferences"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
