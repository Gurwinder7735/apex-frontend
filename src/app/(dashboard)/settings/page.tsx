"use client";

import { useEffect, useState } from "react";
import { Button, Input, Select, Typography, Spin, message, Card, Slider } from "antd";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { storage } from "@/lib/utils/storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Settings {
  hourlyRate: number;
  aiEfficiencyFactor: number;
  currency: string;
  teamSize: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = storage.getAccessToken();
        const res = await fetch(`${API_BASE_URL}/api/v1/proposal-intelligence/settings`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          setSettings(json.data);
        }
      } catch {
        message.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const token = storage.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/proposal-intelligence/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          hourlyRate: settings.hourlyRate,
          aiEfficiencyFactor: settings.aiEfficiencyFactor,
          currency: settings.currency,
          teamSize: settings.teamSize,
        }),
      });
      if (res.ok) {
        message.success("Settings saved");
      } else {
        message.error("Failed to save settings");
      }
    } catch {
      message.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Generation Settings"
        subtitle="Configure default pricing and efficiency parameters for AI proposal generation."
      />

      <div className="max-w-2xl space-y-6">
        <Card className="!rounded-xl !border-zinc-200 !shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon className="w-5 h-5 text-zinc-500" />
            <Typography.Text className="font-semibold text-zinc-800">Pricing Defaults</Typography.Text>
          </div>

          <div className="space-y-5">
            <div>
              <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block mb-1">Hourly Rate</Typography.Text>
              <Typography.Text className="text-xs text-zinc-500 block mb-2">The default rate used by the Commercial Agent to calculate project pricing.</Typography.Text>
              <Input
                type="number"
                prefix="$"
                value={settings?.hourlyRate ?? 75}
                onChange={(e) => setSettings((s) => s ? { ...s, hourlyRate: Number(e.target.value) } : s)}
                className="!w-40"
              />
            </div>

            <div>
              <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block mb-1">Currency</Typography.Text>
              <Select
                value={settings?.currency ?? "USD"}
                onChange={(val) => setSettings((s) => s ? { ...s, currency: val } : s)}
                style={{ width: 120 }}
                options={[
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                  { value: "GBP", label: "GBP" },
                  { value: "INR", label: "INR" },
                  { value: "CAD", label: "CAD" },
                  { value: "AUD", label: "AUD" },
                ]}
              />
            </div>
          </div>
        </Card>

        <Card className="!rounded-xl !border-zinc-200 !shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon className="w-5 h-5 text-zinc-500" />
            <Typography.Text className="font-semibold text-zinc-800">AI Development Efficiency</Typography.Text>
          </div>

          <div className="space-y-5">
            <div>
              <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block mb-1">AI Efficiency Factor</Typography.Text>
              <Typography.Text className="text-xs text-zinc-500 block mb-2">
                How much faster your team is using AI tools vs. traditional development. Lower = faster.
              </Typography.Text>
              <div className="max-w-xs">
                <Slider
                  min={0.05}
                  max={1.0}
                  step={0.05}
                  value={settings?.aiEfficiencyFactor ?? 0.3}
                  onChange={(val) => setSettings((s) => s ? { ...s, aiEfficiencyFactor: val } : s)}
                  tooltip={{ formatter: (v) => `${(v ?? 0.3).toFixed(2)} (${Math.round((1 - (v ?? 0.3)) * 100)}% faster)` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-400 max-w-xs mt-1">
                <span>Very fast (0.05)</span>
                <span>Traditional (1.0)</span>
              </div>
            </div>

            <div>
              <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block mb-1">Team Size</Typography.Text>
              <Typography.Text className="text-xs text-zinc-500 block mb-2">Number of developers working on the project.</Typography.Text>
              <Input
                type="number"
                min={1}
                max={20}
                value={settings?.teamSize ?? 2}
                onChange={(e) => setSettings((s) => s ? { ...s, teamSize: Math.max(1, Number(e.target.value)) } : s)}
                className="!w-24"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="primary" icon={<Save className="w-4 h-4" />} loading={saving} onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
