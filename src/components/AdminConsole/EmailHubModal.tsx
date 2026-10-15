import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldCheck,
  Users,
  Trophy,
  Megaphone,
  TestTube,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Code2,
} from 'lucide-react';
import { Judge, Participant, School, RankingsData } from '../../types';

interface EmailHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  judges: Judge[];
  participants: Participant[];
  schools: School[];
  rankings: RankingsData;
}

interface DispatchLog {
  id: string;
  timestamp: string;
  recipientEmail: string;
  recipientName: string;
  campaign: string;
  subject: string;
  status: 'Sent' | 'Failed' | 'Simulated';
  note?: string;
}

export const EmailHubModal: React.FC<EmailHubModalProps> = ({
  isOpen,
  onClose,
  judges,
  participants,
  schools,
  rankings,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'campaigns' | 'preview' | 'logs' | 'setup'>('campaigns');
  const [campaignType, setCampaignType] = useState<'judges' | 'results' | 'announcement' | 'test'>('judges');

  // Apps Script Web App Configuration
  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return localStorage.getItem('gmu_mase_appscript_url') || '';
  });
  const [portalUrl, setPortalUrl] = useState<string>(() => {
    return localStorage.getItem('gmu_mase_portal_url') || window.location.origin;
  });
  const [simulateMode, setSimulateMode] = useState<boolean>(true);

  // Connection Test & Quota State
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    quota?: number;
    message?: string;
  }>({ tested: false, success: false });

  // Campaign 1: Judges State
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<string[]>([]);
  const [judgeCustomNote, setJudgeCustomNote] = useState('Please arrive at GMU Exhibition Hall B by 9:00 AM for the morning juror briefing.');

  // Campaign 2: Results State
  const [selectedResultScope, setSelectedResultScope] = useState<'top3' | 'top10' | 'all'>('top3');
  const [resultCustomNote, setResultCustomNote] = useState('Official award certificates will be presented at the GMU Main Auditorium at 2:30 PM today.');

  // Campaign 3: Announcement State
  const [announceAudience, setAnnounceAudience] = useState<'all' | 'judges' | 'schools' | 'participants'>('all');
  const [announceSubject, setAnnounceSubject] = useState('GMU MASE 2026: Important Schedule Update & Hall Access');
  const [announceBody, setAnnounceBody] = useState(
    'Welcome to the Gulf Medical University MASE 2026 Exhibition! Live judging is now officially active across all hall tables. Please ensure student teams remain by their exhibition booths during juror rounds.'
  );

  // Campaign 4: Test Email State
  const [testEmailAddress, setTestEmailAddress] = useState('disolutions.com@gmail.com');
  const [testRecipientName, setTestRecipientName] = useState('GMU MASE Coordinator');

  // Dispatch Progress State
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState<{
    current: number;
    total: number;
    currentName: string;
  }>({ current: 0, total: 0, currentName: '' });

  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewTemplate, setPreviewTemplate] = useState<'judge' | 'result' | 'announcement'>('judge');

  // Logs & History
  const [logs, setLogs] = useState<DispatchLog[]>(() => {
    const saved = localStorage.getItem('gmu_mase_email_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'LOG-INIT',
        timestamp: new Date().toISOString(),
        recipientEmail: 'dr.sarah.mansour@gmu.ac.ae',
        recipientName: 'Dr. Sarah Mansour',
        campaign: 'Judge Invitation',
        subject: 'Official Judge Portal Credentials & Scoring Schedule',
        status: 'Simulated',
        note: 'Code: GMU-7721'
      }
    ];
  });

  const [copiedCode, setCopiedCode] = useState(false);

  // Initialize selected judges with all judges
  useEffect(() => {
    if (judges.length > 0 && selectedJudgeIds.length === 0) {
      setSelectedJudgeIds(judges.map(j => j.JudgeID));
    }
  }, [judges]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('gmu_mase_appscript_url', webAppUrl);
  }, [webAppUrl]);

  useEffect(() => {
    localStorage.setItem('gmu_mase_portal_url', portalUrl);
  }, [portalUrl]);

  useEffect(() => {
    localStorage.setItem('gmu_mase_email_logs', JSON.stringify(logs));
  }, [logs]);

  if (!isOpen) return null;

  // Test Connection
  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Please paste your Google Apps Script Web App URL first.'
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus({ tested: false, success: false });

    try {
      // Send ping or getEmailQuota
      const url = `${webAppUrl.trim()}${webAppUrl.includes('?') ? '&' : '?'}action=getEmailQuota`;
      const res = await fetch(url, { method: 'GET', mode: 'cors' });
      const data = await res.json();

      if (data && data.success) {
        setConnectionStatus({
          tested: true,
          success: true,
          quota: data.remainingDailyQuota,
          message: `Connected! Remaining quota today: ${data.remainingDailyQuota} emails.`
        });
        setSimulateMode(false);
      } else {
        setConnectionStatus({
          tested: true,
          success: false,
          message: data.error || 'Server responded with unexpected data.'
        });
      }
    } catch (err: any) {
      // In case CORS blocks GET, inform user or enable fallback
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Could not connect directly. Ensure your Web App is deployed with "Execute as: Me" and "Who has access: Anyone".'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Helper to add dispatch log
  const addLog = (log: Omit<DispatchLog, 'id' | 'timestamp'>) => {
    const newLog: DispatchLog = {
      ...log,
      id: `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Send Single Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) {
      alert('Please enter a valid recipient email address.');
      return;
    }

    setIsDispatching(true);
    setDispatchProgress({ current: 1, total: 1, currentName: testRecipientName });

    if (simulateMode || !webAppUrl.trim()) {
      await new Promise(r => setTimeout(r, 900));
      addLog({
        recipientEmail: testEmailAddress,
        recipientName: testRecipientName,
        campaign: 'Test Verification',
        subject: 'GMU MASE 2026 - Email Dispatch Connection Verified',
        status: 'Simulated',
        note: 'Simulated dispatch (enable live backend to send real inbox email)'
      });
      setIsDispatching(false);
      alert(`Simulation Successful: Email logged for ${testEmailAddress}. Configure Apps Script Web App URL to send live emails!`);
      return;
    }

    try {
      const response = await fetch(webAppUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'testEmail',
          toEmail: testEmailAddress.trim(),
          userName: testRecipientName.trim()
        })
      });
      const data = await response.json();

      if (data && data.success) {
        addLog({
          recipientEmail: testEmailAddress,
          recipientName: testRecipientName,
          campaign: 'Test Verification',
          subject: 'GMU MASE 2026 - Email Dispatch Connection Verified',
          status: 'Sent',
          note: `Live dispatch via Google Apps Script (Quota left: ${data.remainingQuota})`
        });
        alert(`Success! Real test email sent to ${testEmailAddress}. Check your inbox!`);
      } else {
        throw new Error(data.error || 'Failed to send');
      }
    } catch (err: any) {
      addLog({
        recipientEmail: testEmailAddress,
        recipientName: testRecipientName,
        campaign: 'Test Verification',
        subject: 'GMU MASE 2026 - Email Dispatch Connection Verified',
        status: 'Failed',
        note: err.message
      });
      alert(`Error sending test email: ${err.message}. Check your Web App permissions.`);
    } finally {
      setIsDispatching(false);
    }
  };

  // Batch Dispatch Judge Credentials
  const handleDispatchJudgeInvites = async () => {
    const targetJudges = judges.filter(j => selectedJudgeIds.includes(j.JudgeID));
    if (targetJudges.length === 0) {
      alert('Please select at least one judge.');
      return;
    }

    setIsDispatching(true);
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < targetJudges.length; i++) {
      const judge = targetJudges[i];
      setDispatchProgress({
        current: i + 1,
        total: targetJudges.length,
        currentName: judge.Name
      });

      if (simulateMode || !webAppUrl.trim()) {
        await new Promise(r => setTimeout(r, 350));
        addLog({
          recipientEmail: judge.Email || 'judge@gmu.ac.ae',
          recipientName: judge.Name,
          campaign: 'Judge Invitation',
          subject: '⚖️ GMU MASE 2026: Official Judge Portal Credentials & Scoring Schedule',
          status: 'Simulated',
          note: `Categories: ${judge.Categories || 'All'}`
        });
        sent++;
      } else {
        try {
          const res = await fetch(webAppUrl.trim(), {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'sendJudgeInvite',
              judgeId: judge.JudgeID,
              portalUrl: portalUrl,
              customNote: judgeCustomNote
            })
          });
          const data = await res.json();
          if (data && data.success) {
            addLog({
              recipientEmail: judge.Email,
              recipientName: judge.Name,
              campaign: 'Judge Invitation',
              subject: '⚖️ GMU MASE 2026: Official Judge Portal Credentials & Scoring Schedule',
              status: 'Sent',
              note: `Code: ${data.accessCode}`
            });
            sent++;
          } else {
            failed++;
            addLog({
              recipientEmail: judge.Email,
              recipientName: judge.Name,
              campaign: 'Judge Invitation',
              subject: '⚖️ GMU MASE 2026: Official Judge Portal Credentials & Scoring Schedule',
              status: 'Failed',
              note: data.message || 'Error'
            });
          }
        } catch (err: any) {
          failed++;
          addLog({
            recipientEmail: judge.Email,
            recipientName: judge.Name,
            campaign: 'Judge Invitation',
            subject: '⚖️ GMU MASE 2026: Official Judge Portal Credentials & Scoring Schedule',
            status: 'Failed',
            note: err.message
          });
        }
      }
    }

    setIsDispatching(false);
    alert(`Campaign Complete: ${sent} judge invitations dispatched (${failed} failed). Check the 'Sent Logs' tab for full details.`);
  };

  // Batch Dispatch Results & Winner Notifications
  const handleDispatchResults = async () => {
    let targetParticipants = [...participants];
    if (selectedResultScope === 'top3') {
      const topIds = rankings.overallTop10.slice(0, 3).map(r => r.participantId);
      targetParticipants = participants.filter(p => topIds.includes(p.ParticipantID));
    } else if (selectedResultScope === 'top10') {
      const topIds = rankings.overallTop10.map(r => r.participantId);
      targetParticipants = participants.filter(p => topIds.includes(p.ParticipantID));
    }

    if (targetParticipants.length === 0) {
      alert('No projects match the selected criteria for results delivery.');
      return;
    }

    setIsDispatching(true);
    let sent = 0;

    for (let i = 0; i < targetParticipants.length; i++) {
      const part = targetParticipants[i];
      setDispatchProgress({
        current: i + 1,
        total: targetParticipants.length,
        currentName: part.Title
      });

      if (simulateMode || !webAppUrl.trim()) {
        await new Promise(r => setTimeout(r, 350));
        addLog({
          recipientEmail: part.Email || 'student@school.edu',
          recipientName: part.LeadName || part.SchoolName,
          campaign: 'Award & Results',
          subject: `🏆 GMU MASE 2026: Official Exhibition Results & Performance Summary - ${part.Title}`,
          status: 'Simulated',
          note: `School: ${part.SchoolName} (${part.Emirate})`
        });
        sent++;
      } else {
        try {
          const res = await fetch(webAppUrl.trim(), {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'sendResultNotification',
              participantId: part.ParticipantID,
              portalUrl: portalUrl,
              customNote: resultCustomNote
            })
          });
          const data = await res.json();
          if (data && data.success) {
            sent++;
            addLog({
              recipientEmail: part.Email || '',
              recipientName: part.LeadName || part.SchoolName,
              campaign: 'Award & Results',
              subject: `🏆 GMU MASE 2026: Official Exhibition Results - ${part.Title}`,
              status: 'Sent',
              note: `Score: ${data.percentage}%`
            });
          } else {
            addLog({
              recipientEmail: part.Email || '',
              recipientName: part.LeadName || part.SchoolName,
              campaign: 'Award & Results',
              subject: `🏆 GMU MASE 2026: Results - ${part.Title}`,
              status: 'Failed',
              note: data.message
            });
          }
        } catch (err: any) {
          addLog({
            recipientEmail: part.Email || '',
            recipientName: part.LeadName || part.SchoolName,
            campaign: 'Award & Results',
            subject: `🏆 GMU MASE 2026: Results - ${part.Title}`,
            status: 'Failed',
            note: err.message
          });
        }
      }
    }

    setIsDispatching(false);
    alert(`Results Delivery Complete: ${sent} scorecards dispatched! View history in 'Sent Logs'.`);
  };

  // Broadcast Announcement
  const handleDispatchAnnouncement = async () => {
    if (!announceSubject.trim() || !announceBody.trim()) {
      alert('Subject and announcement message cannot be blank.');
      return;
    }

    setIsDispatching(true);
    setDispatchProgress({ current: 1, total: 1, currentName: `Broadcast to ${announceAudience}` });

    if (simulateMode || !webAppUrl.trim()) {
      await new Promise(r => setTimeout(r, 700));
      addLog({
        recipientEmail: `${announceAudience}@gmu-mase.ae`,
        recipientName: `All ${announceAudience.toUpperCase()}`,
        campaign: 'Broadcast Announcement',
        subject: announceSubject,
        status: 'Simulated',
        note: `Target Audience: ${announceAudience}`
      });
      setIsDispatching(false);
      alert(`Broadcast Simulated: Announcement logged for all ${announceAudience}.`);
      return;
    }

    try {
      const res = await fetch(webAppUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sendCustomAnnouncement',
          audience: announceAudience,
          subject: announceSubject,
          messageBody: announceBody,
          ctaText: 'Open Exhibition Live Portal',
          ctaUrl: portalUrl
        })
      });
      const data = await res.json();
      if (data && data.success) {
        addLog({
          recipientEmail: `${announceAudience}@broadcast`,
          recipientName: `${data.sentCount} Recipients (${announceAudience})`,
          campaign: 'Broadcast Announcement',
          subject: announceSubject,
          status: 'Sent',
          note: `Sent to ${data.sentCount} people (${data.failCount} failed)`
        });
        alert(`Broadcast successfully sent to ${data.sentCount} recipients!`);
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (err: any) {
      alert(`Error broadcasting: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(
      `// Apps Script Web App URL deployment snippet:\n// Ensure doGet() and doPost() are deployed as Web App with "Execute as: Me" & "Who has access: Anyone"\n`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B6E4F] via-[#065F46] to-[#044E3B] px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-[#D4AF37]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">GMU Email Dispatch Center</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37]/20 border border-[#D4AF37] text-amber-200">
                  Google Apps Script Backend
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Dispatch personalized judge credentials, top winner certificates, and regional announcements directly to inboxes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode & Status Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${simulateMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
              Mode:
            </span>
            <button
              onClick={() => setSimulateMode(!simulateMode)}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                simulateMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
              }`}
            >
              {simulateMode ? '⚡ Safe Simulation Mode (Testing)' : '🚀 Live Delivery Mode (Google Apps Script)'}
            </button>
            <span className="text-slate-500 hidden sm:inline">
              {simulateMode ? 'Simulates emails without consuming Google quota' : 'Sends genuine emails via Google MailApp'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {webAppUrl ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Backend Linked
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Apps Script URL Not Set
              </span>
            )}
            <button
              onClick={() => setActiveTab('setup')}
              className="text-slate-600 hover:text-emerald-700 font-semibold underline ml-1"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 shrink-0">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'border-[#0B6E4F] text-[#0B6E4F]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            Email Campaigns
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-[#0B6E4F] text-[#0B6E4F]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Live HTML Template Preview
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-[#0B6E4F] text-[#0B6E4F]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Sent Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-[#0B6E4F] text-[#0B6E4F]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Backend Setup & Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Campaign Type Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setCampaignType('judges')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    campaignType === 'judges'
                      ? 'border-[#0B6E4F] bg-emerald-50/60 shadow-sm ring-2 ring-[#0B6E4F]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#0B6E4F] flex items-center justify-center mb-2">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-slate-900">Juror Credentials</div>
                  <div className="text-xs text-slate-500 mt-0.5">Send private access codes & assignments</div>
                  <div className="mt-2 text-[11px] font-semibold text-emerald-700">{judges.length} Jurors available</div>
                </button>

                <button
                  onClick={() => setCampaignType('results')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    campaignType === 'results'
                      ? 'border-[#0B6E4F] bg-emerald-50/60 shadow-sm ring-2 ring-[#0B6E4F]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-slate-900">Awards & Results</div>
                  <div className="text-xs text-slate-500 mt-0.5">Disclose final ranks & scorecards</div>
                  <div className="mt-2 text-[11px] font-semibold text-amber-700">Top 3, Top 10 or All</div>
                </button>

                <button
                  onClick={() => setCampaignType('announcement')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    campaignType === 'announcement'
                      ? 'border-[#0B6E4F] bg-emerald-50/60 shadow-sm ring-2 ring-[#0B6E4F]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-slate-900">Announcement</div>
                  <div className="text-xs text-slate-500 mt-0.5">Broadcast message to groups</div>
                  <div className="mt-2 text-[11px] font-semibold text-blue-700">Custom message & CTA</div>
                </button>

                <button
                  onClick={() => setCampaignType('test')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    campaignType === 'test'
                      ? 'border-[#0B6E4F] bg-emerald-50/60 shadow-sm ring-2 ring-[#0B6E4F]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                    <TestTube className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-slate-900">Test Deliverability</div>
                  <div className="text-xs text-slate-500 mt-0.5">Send verification email to yourself</div>
                  <div className="mt-2 text-[11px] font-semibold text-purple-700">Instant test</div>
                </button>
              </div>

              {/* Progress Indicator when dispatching */}
              {isDispatching && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    Dispatching ({dispatchProgress.current}/{dispatchProgress.total}): {dispatchProgress.currentName}
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-[#0B6E4F] h-2 transition-all duration-300"
                      style={{ width: `${(dispatchProgress.current / dispatchProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* CAMPAIGN CONTENT: JUDGES */}
              {campaignType === 'judges' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Select Jurors for Credential Delivery</h3>
                      <p className="text-xs text-slate-500">Each juror receives an encrypted access code and direct link to the Live Judging UI.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedJudgeIds(judges.map(j => j.JudgeID))}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        Select All ({judges.length})
                      </button>
                      <button
                        onClick={() => setSelectedJudgeIds([])}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Juror List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {judges.map(judge => {
                      const isSelected = selectedJudgeIds.includes(judge.JudgeID);
                      return (
                        <label
                          key={judge.JudgeID}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/50 border-emerald-300'
                              : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedJudgeIds(prev => [...prev, judge.JudgeID]);
                              } else {
                                setSelectedJudgeIds(prev => prev.filter(id => id !== judge.JudgeID));
                              }
                            }}
                            className="mt-0.5 rounded text-[#0B6E4F] focus:ring-[#0B6E4F]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 truncate">{judge.Name}</div>
                            <div className="text-slate-500 truncate">{judge.Email || 'No email registered'}</div>
                            <div className="text-[11px] text-[#0B6E4F] font-semibold mt-0.5">
                              {judge.Categories || 'General Jury'}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Custom Note */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Juror Briefing Note (Appears in Email)
                    </label>
                    <input
                      type="text"
                      value={judgeCustomNote}
                      onChange={(e) => setJudgeCustomNote(e.target.value)}
                      placeholder="e.g. Please report to GMU Exhibition Hall B by 9:00 AM"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Selected: <strong>{selectedJudgeIds.length}</strong> of {judges.length} Jurors
                    </span>
                    <button
                      onClick={handleDispatchJudgeInvites}
                      disabled={isDispatching || selectedJudgeIds.length === 0}
                      className="px-5 py-2.5 bg-[#0B6E4F] hover:bg-[#09573e] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {simulateMode ? 'Simulate Juror Delivery' : `Send ${selectedJudgeIds.length} Juror Invitations`}
                    </button>
                  </div>
                </div>
              )}

              {/* CAMPAIGN CONTENT: RESULTS */}
              {campaignType === 'results' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Disclose Exhibition Results & Certificates</h3>
                    <p className="text-xs text-slate-500">Sends official performance breakdown, percentage scores, and ceremony announcements.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedResultScope('top3')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedResultScope === 'top3'
                          ? 'border-[#0B6E4F] bg-emerald-50 text-[#0B6E4F] font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">Top 3 Grand Winners Only</div>
                      <div className="text-[11px] text-slate-500 mt-1">Podium winners across all categories</div>
                    </button>

                    <button
                      onClick={() => setSelectedResultScope('top10')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedResultScope === 'top10'
                          ? 'border-[#0B6E4F] bg-emerald-50 text-[#0B6E4F] font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">Top 10 Finalists</div>
                      <div className="text-[11px] text-slate-500 mt-1">Leading projects for grand exhibition</div>
                    </button>

                    <button
                      onClick={() => setSelectedResultScope('all')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedResultScope === 'all'
                          ? 'border-[#0B6E4F] bg-emerald-50 text-[#0B6E4F] font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">All {participants.length} Evaluated Projects</div>
                      <div className="text-[11px] text-slate-500 mt-1">Send individual scores to every school</div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Awards Ceremony Instructions (Appears in Email)
                    </label>
                    <textarea
                      rows={2}
                      value={resultCustomNote}
                      onChange={(e) => setResultCustomNote(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleDispatchResults}
                      disabled={isDispatching}
                      className="px-5 py-2.5 bg-[#0B6E4F] hover:bg-[#09573e] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      {simulateMode ? 'Simulate Results Delivery' : 'Dispatch Official Result Emails'}
                    </button>
                  </div>
                </div>
              )}

              {/* CAMPAIGN CONTENT: ANNOUNCEMENT */}
              {campaignType === 'announcement' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience</label>
                      <select
                        value={announceAudience}
                        onChange={(e: any) => setAnnounceAudience(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                      >
                        <option value="all">Everyone (All Jurors, Schools, and Participants)</option>
                        <option value="judges">All Distinguished Jurors Only</option>
                        <option value="schools">All Participating School Representatives</option>
                        <option value="participants">All Student Project Leads</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Subject</label>
                      <input
                        type="text"
                        value={announceSubject}
                        onChange={(e) => setAnnounceSubject(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Broadcast Message Content</label>
                    <textarea
                      rows={4}
                      value={announceBody}
                      onChange={(e) => setAnnounceBody(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleDispatchAnnouncement}
                      disabled={isDispatching}
                      className="px-5 py-2.5 bg-[#0B6E4F] hover:bg-[#09573e] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      {simulateMode ? 'Simulate Broadcast Announcement' : 'Send Live Broadcast Email'}
                    </button>
                  </div>
                </div>
              )}

              {/* CAMPAIGN CONTENT: TEST */}
              {campaignType === 'test' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-900">
                    <strong>Test Deliverability:</strong> Send a verification email directly to your inbox to confirm that Google Apps Script is sending HTML emails properly with GMU branding.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Email Address</label>
                      <input
                        type="email"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        placeholder="your-email@example.com"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Name</label>
                      <input
                        type="text"
                        value={testRecipientName}
                        onChange={(e) => setTestRecipientName(e.target.value)}
                        placeholder="e.g. Dr. Exhibition Lead"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">
                      Backend Status: {webAppUrl ? 'Ready to dispatch' : 'Enter Apps Script URL in Setup tab first'}
                    </span>
                    <button
                      onClick={handleSendTestEmail}
                      disabled={isDispatching}
                      className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Verification Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Device and Template Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Template:</span>
                  <button
                    onClick={() => setPreviewTemplate('judge')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      previewTemplate === 'judge' ? 'bg-[#0B6E4F] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Juror Invitation
                  </button>
                  <button
                    onClick={() => setPreviewTemplate('result')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      previewTemplate === 'result' ? 'bg-[#0B6E4F] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Results Scorecard
                  </button>
                  <button
                    onClick={() => setPreviewTemplate('announcement')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      previewTemplate === 'announcement' ? 'bg-[#0B6E4F] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Broadcast Notice
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      previewDevice === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      previewDevice === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Mobile
                  </button>
                </div>
              </div>

              {/* Email Client Mockup */}
              <div className="flex justify-center">
                <div
                  className={`bg-slate-100 border border-slate-300 rounded-3xl p-4 shadow-inner transition-all ${
                    previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-2xl'
                  }`}
                >
                  {/* Email Frame */}
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* GMU Header */}
                    <div className="bg-gradient-to-r from-[#0B6E4F] to-[#044E3B] p-6 text-center text-white">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                        Gulf Medical University &bull; Ajman UAE
                      </div>
                      <h1 className="text-xl font-extrabold tracking-tight mt-1">MASE EXHIBITION 2026</h1>
                      <div className="inline-block bg-[#D4AF37]/20 border border-[#D4AF37] text-amber-200 text-[11px] font-bold px-3 py-0.5 rounded-full mt-2">
                        {previewTemplate === 'judge' && 'Official Juror Credentials'}
                        {previewTemplate === 'result' && 'Official Award & Score Report'}
                        {previewTemplate === 'announcement' && 'Official Exhibition Notice'}
                      </div>
                    </div>

                    {/* Email Content Body */}
                    <div className="p-6 text-slate-800 text-xs sm:text-sm space-y-4">
                      {previewTemplate === 'judge' && (
                        <>
                          <p>Dear <strong>Dr. Sarah Mansour</strong>,</p>
                          <p className="text-slate-600 leading-relaxed">
                            Thank you for serving as a Distinguished Juror for the <strong>Gulf Medical University Medical and Science Exhibition (MASE) 2026</strong>. Your expertise ensures fair, rigorous evaluation of student innovators across the UAE.
                          </p>

                          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-center my-4">
                            <div className="text-[10px] font-black tracking-widest uppercase text-amber-800">
                              Your Private Judge Access Code
                            </div>
                            <div className="text-3xl font-black tracking-widest text-slate-900 font-mono my-2">
                              GMU-7721
                            </div>
                            <div className="text-xs text-amber-900 font-medium">
                              Enter this code on the Live Judging Portal to begin scoring assigned tables.
                            </div>
                          </div>

                          <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs">
                            <div className="flex justify-between py-2 px-3">
                              <span className="text-slate-500">Assigned Categories:</span>
                              <span className="font-bold text-[#0B6E4F]">Scientific Research, Healthcare AI</span>
                            </div>
                            <div className="flex justify-between py-2 px-3">
                              <span className="text-slate-500">Academic Institution:</span>
                              <span className="font-semibold text-slate-800">Gulf Medical University</span>
                            </div>
                            <div className="flex justify-between py-2 px-3">
                              <span className="text-slate-500">Scoring Criteria:</span>
                              <span className="font-semibold text-slate-800">Theme, Knowledge, Creativity, Presentation (40 pts)</span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-[#0B6E4F] text-xs text-slate-700">
                            <strong>Juror Briefing:</strong> {judgeCustomNote}
                          </div>

                          <div className="text-center pt-2">
                            <a
                              href={portalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block px-6 py-3 bg-[#0B6E4F] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#09573e]"
                            >
                              Open Judge Portal &rarr;
                            </a>
                          </div>
                        </>
                      )}

                      {previewTemplate === 'result' && (
                        <>
                          <p>Dear <strong>Fatima Al Zaabi</strong> & Supervisor <strong>Dr. Anita Roy</strong>,</p>
                          <p className="text-slate-600 leading-relaxed">
                            The Jury Panel has finalized evaluations for the <strong>Gulf Medical University MASE Exhibition 2026</strong>. We are delighted to present your official evaluation summary below.
                          </p>

                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center my-4">
                            <div className="text-[10px] font-black tracking-widest uppercase text-emerald-800">
                              Overall Exhibition Score
                            </div>
                            <div className="text-4xl font-black text-[#0B6E4F] my-1">
                              94.5%
                            </div>
                            <div className="text-xs text-emerald-700 font-bold">
                              37.8 out of 40 Points &bull; Evaluated by 3 Jurors
                            </div>
                          </div>

                          <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs">
                            <div className="flex justify-between py-2 px-3">
                              <span className="text-slate-500">Project Title:</span>
                              <span className="font-bold text-slate-900">AI-Assisted Early Diabetic Retinopathy Scanner</span>
                            </div>
                            <div className="flex justify-between py-2 px-3">
                              <span className="text-slate-500">School:</span>
                              <span className="font-semibold text-slate-800">GEMS Modern Academy (Dubai)</span>
                            </div>
                            <div className="flex justify-between py-2 px-3">
                              <span className="text-slate-500">Category:</span>
                              <span className="font-semibold text-slate-800">Scientific Research</span>
                            </div>
                            <div className="flex justify-between py-2 px-3">
                              <span className="text-slate-500">Exhibition Table:</span>
                              <span className="font-semibold text-slate-800">Table A-01</span>
                            </div>
                          </div>

                          <div className="p-3 bg-amber-50 rounded-xl border-l-4 border-[#D4AF37] text-xs text-amber-950">
                            <strong>Ceremony Notice:</strong> {resultCustomNote}
                          </div>

                          <div className="text-center pt-2">
                            <a
                              href={portalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block px-6 py-3 bg-[#0B6E4F] text-white font-bold text-xs rounded-xl shadow-md"
                            >
                              View Live Leaderboard &rarr;
                            </a>
                          </div>
                        </>
                      )}

                      {previewTemplate === 'announcement' && (
                        <>
                          <p>Dear <strong>Participant / Juror</strong>,</p>
                          <div className="text-slate-600 leading-relaxed space-y-2">
                            <p>{announceBody}</p>
                          </div>

                          <div className="text-center pt-4">
                            <a
                              href={portalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block px-6 py-3 bg-[#0B6E4F] text-white font-bold text-xs rounded-xl shadow-md"
                            >
                              Open Exhibition Live Portal &rarr;
                            </a>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Email Footer */}
                    <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-[11px] text-slate-400">
                      <div><strong>Gulf Medical University (GMU)</strong> &bull; Medical & Science Exhibition</div>
                      <div>Al Jurf 1, PO Box 4184, Ajman, United Arab Emirates</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGS & HISTORY */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dispatched Emails Audit Trail</h3>
                  <p className="text-xs text-slate-500">All simulated and live sent emails are recorded with timestamps.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Clear email dispatch logs?')) {
                        setLogs([]);
                      }
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Clear History
                  </button>
                  <button
                    onClick={() => {
                      const csv = 'Timestamp,RecipientEmail,RecipientName,Campaign,Subject,Status,Note\n' +
                        logs.map(l => `"${l.timestamp}","${l.recipientEmail}","${l.recipientName}","${l.campaign}","${l.subject}","${l.status}","${l.note || ''}"`).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `GMU_MASE_Email_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No emails have been dispatched yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Recipient</th>
                        <th className="py-2.5 px-3">Campaign</th>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{log.recipientName}</div>
                            <div className="text-[11px] text-slate-500">{log.recipientEmail}</div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{log.campaign}</td>
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{log.subject}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'Sent'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'Simulated'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">{log.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETUP & GUIDE */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0B6E4F] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Google Apps Script Web App Backend Connection</h3>
                    <p className="text-xs text-slate-500">
                      Connect your Google Sheet Apps Script to enable live emails with zero server infrastructure.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Google Apps Script Web App URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={webAppUrl}
                        onChange={(e) => setWebAppUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                        className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                      />
                      <button
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                      >
                        {isTestingConnection ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        Test Connection
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      GitHub Pages Frontend Application URL (Used in email buttons)
                    </label>
                    <input
                      type="url"
                      value={portalUrl}
                      onChange={(e) => setPortalUrl(e.target.value)}
                      placeholder="https://your-github-username.github.io/gmu-mase-judging/"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                  </div>

                  {connectionStatus.tested && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-medium ${
                        connectionStatus.success
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'bg-red-50 border border-red-200 text-red-900'
                      }`}
                    >
                      {connectionStatus.success ? '✅ ' : '❌ '}
                      {connectionStatus.message}
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Step Setup Guide */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  How to Deploy in 30 Seconds
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#0B6E4F] text-white flex items-center justify-center font-bold text-xs mb-2">
                      1
                    </div>
                    <div className="font-bold text-slate-900">Open Apps Script</div>
                    <p className="text-slate-600">
                      In your Google Sheet, open <strong>Extensions &gt; Apps Script</strong>. Paste the code from <code>Code.gs</code>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#0B6E4F] text-white flex items-center justify-center font-bold text-xs mb-2">
                      2
                    </div>
                    <div className="font-bold text-slate-900">Set Permissions (Key Step)</div>
                    <p className="text-slate-600">
                      Click <strong>Deploy &gt; New deployment</strong> &gt; Web App. Set <strong>Execute as: "Me"</strong> and <strong>Who has access: "Anyone"</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#0B6E4F] text-white flex items-center justify-center font-bold text-xs mb-2">
                      3
                    </div>
                    <div className="font-bold text-slate-900">Copy Web App URL</div>
                    <p className="text-slate-600">
                      Copy the generated URL ending in <code>/exec</code> and paste it into the field above.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Why "Execute as: Me"?</strong> When set to "Me", Google uses your admin quota to send emails and save scores. Jurors, students, and schools never get Google login prompts or Drive permission blocks!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {simulateMode ? (
              <span className="text-amber-700 font-semibold">⚡ Simulation Active: Safe for demos</span>
            ) : (
              <span className="text-emerald-700 font-semibold">🚀 Live Mode: Real email delivery active</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
