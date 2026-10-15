/**
 * GULF MEDICAL UNIVERSITY (GMU) - MASE EXHIBITION
 * REST API & EMAIL BACKEND WEB APP FOR GOOGLE SHEETS
 * 
 * =====================================================================================
 * CRITICAL FIX FOR GOOGLE DRIVE PERMISSION ERRORS:
 * -------------------------------------------------------------------------------------
 * Problem: When deploying Apps Script with standard permissions, Google Drive blocks
 * external access with "Sign in required" or "Access Denied" or cross-domain policy.
 * 
 * THE SOLUTION:
 * 1. Deploy this script as a "Web App"
 * 2. Set "Execute as": "Me" (your admin Google account that owns the Sheet)
 * 3. Set "Who has access": "Anyone" (EVEN ANONYMOUS)
 * 4. This means the Web App runs with YOUR spreadsheet and Gmail authorization, so
 *    judges, faculty, and email recipients NEVER need Google accounts or Drive permission prompts!
 * =====================================================================================
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    switch (action) {
      case 'ping':
        return jsonResponse({
          status: 'ok',
          message: 'GMU MASE API & Email Backend is online',
          timestamp: new Date().toISOString()
        });

      case 'getEmailQuota':
        return jsonResponse(getEmailQuota());

      case 'getEmailLogs':
        return jsonResponse(getSheetRecords(ss, 'EmailLogs'));

      case 'getRankings':
        return jsonResponse(computeLiveRankings(ss));

      case 'getRegionalStats':
        return jsonResponse(computeRegionalBreakdown(ss));

      case 'getParticipants':
        return jsonResponse(getSheetRecords(ss, 'Participants'));

      case 'getSchools':
        return jsonResponse(getSheetRecords(ss, 'Schools'));

      case 'getCategories':
        return jsonResponse(getSheetRecords(ss, 'Categories'));

      case 'getJudges':
        return jsonResponse(getSheetRecords(ss, 'Judges'));

      case 'getJudgeActivity':
        return jsonResponse(computeJudgeActivity(ss));

      case 'verifyJudgeCode':
        var code = (e.parameter.code || '').trim().toUpperCase();
        return jsonResponse(verifyJudgeAccessCode(ss, code));

      default:
        return jsonResponse({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ error: err.toString(), stack: err.stack });
  }
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var payload = {};
  
  try {
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON payload: ' + err.message });
  }

  var action = payload.action || 'submitEvaluation';

  try {
    switch (action) {
      case 'submitEvaluation':
        return jsonResponse(saveEvaluation(ss, payload.evaluation, payload.responses));

      case 'reassignTable':
        return jsonResponse(reassignParticipantTable(ss, payload.participantId, payload.newTableName, payload.user, payload.reason));

      case 'verifyJudge':
        return jsonResponse(verifyJudgeAccessCode(ss, payload.code));

      // -------------------------------------------------------------
      // EMAIL INTEGRATION ACTIONS
      // -------------------------------------------------------------
      case 'testEmail':
        return jsonResponse(sendTestEmail(ss, payload.toEmail, payload.userName));

      case 'sendJudgeInvite':
        return jsonResponse(sendSingleJudgeInvite(ss, payload.judgeId, payload.portalUrl, payload.customNote));

      case 'sendBatchJudgeInvites':
        return jsonResponse(sendBatchJudgeInvites(ss, payload.judgeIds, payload.portalUrl, payload.customNote));

      case 'sendResultNotification':
        return jsonResponse(sendSingleResultNotification(ss, payload.participantId, payload.portalUrl, payload.customNote));

      case 'sendBatchResults':
        return jsonResponse(sendBatchResultNotifications(ss, payload.participantIds, payload.portalUrl, payload.customNote));

      case 'sendCustomAnnouncement':
        return jsonResponse(sendCustomAnnouncement(ss, payload.audience, payload.subject, payload.messageBody, payload.ctaText, payload.ctaUrl));

      default:
        return jsonResponse({ error: 'Unknown POST action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

// -----------------------------------------------------------------------------
// CORE BUSINESS LOGIC & DATA HELPERS
// -----------------------------------------------------------------------------

function getSheetRecords(ss, sheetName) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) return [];
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  
  var headers = data[0];
  var records = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    records.push(obj);
  }
  return records;
}

function verifyJudgeAccessCode(ss, code) {
  if (!code) return { success: false, message: 'Access code required' };
  
  var authRecords = getSheetRecords(ss, 'JudgeAuth');
  var judges = getSheetRecords(ss, 'Judges');
  
  var matchAuth = authRecords.find(function(r) {
    return String(r.AccessCode).trim().toUpperCase() === code.trim().toUpperCase();
  });
  
  if (!matchAuth) {
    return { success: false, message: 'Invalid judge access code' };
  }
  
  var judge = judges.find(function(j) { return j.JudgeID === matchAuth.JudgeID; });
  if (!judge) {
    return { success: false, message: 'Judge record not found' };
  }
  
  // Update last login
  var authSh = ss.getSheetByName('JudgeAuth');
  if (authSh) {
    var authData = authSh.getDataRange().getValues();
    for (var i = 1; i < authData.length; i++) {
      if (String(authData[i][1]).trim().toUpperCase() === code.trim().toUpperCase()) {
        authSh.getRange(i + 1, 4).setValue(new Date().toISOString());
        break;
      }
    }
  }

  return {
    success: true,
    judge: judge
  };
}

function saveEvaluation(ss, evalObj, responses) {
  var evalSh = ss.getSheetByName('Evaluations');
  if (!evalSh) throw new Error('Evaluations sheet missing');

  var evalId = 'EVL-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  var now = new Date().toISOString();

  var total = (Number(evalObj.C1) || 0) + (Number(evalObj.C2) || 0) + (Number(evalObj.C3) || 0) + (Number(evalObj.C4) || 0) - (Number(evalObj.TimePenalty) || 0);
  var maxTotal = 40;
  var percentage = Math.round((total / maxTotal) * 10000) / 100;

  evalSh.appendRow([
    evalId,
    evalObj.ParticipantID,
    evalObj.SchoolID || '',
    evalObj.CategoryID || '',
    evalObj.TableID || '',
    evalObj.JudgeID,
    evalObj.JudgeName,
    evalObj.RubricID || 'GMU-RUBRIC-2026',
    evalObj.RubricVersion || '1.0',
    evalObj.C1 || 0,
    evalObj.C2 || 0,
    evalObj.C3 || 0,
    evalObj.C4 || 0,
    evalObj.TimePenalty || 0,
    total,
    maxTotal,
    percentage,
    evalObj.Comments || '',
    'Submitted',
    now,
    now,
    now,
    ''
  ]);

  if (responses && responses.length > 0) {
    var respSh = ss.getSheetByName('EvaluationResponses');
    if (respSh) {
      responses.forEach(function(r) {
        respSh.appendRow([
          evalId,
          r.CriterionID,
          r.CriterionName,
          r.BandLabel || '',
          r.Points || 0
        ]);
      });
    }
  }

  var auditSh = ss.getSheetByName('AuditLog');
  if (auditSh) {
    auditSh.appendRow([
      now,
      evalObj.JudgeName || 'Judge',
      'SubmitEvaluation',
      'Evaluation',
      evalId,
      'Score: ' + total + '/' + maxTotal + ' (' + percentage + '%) for ' + evalObj.ParticipantID
    ]);
  }

  return {
    success: true,
    evaluationId: evalId,
    total: total,
    percentage: percentage
  };
}

function reassignParticipantTable(ss, participantId, newTableName, user, reason) {
  var partSh = ss.getSheetByName('Participants');
  var assignSh = ss.getSheetByName('TableAssignments');
  if (!partSh || !assignSh) throw new Error('Missing Participants or TableAssignments sheet');

  var partData = partSh.getDataRange().getValues();
  var rowIndex = -1;
  var prevTable = '';
  var partRecord = null;

  for (var i = 1; i < partData.length; i++) {
    if (partData[i][0] === participantId) {
      rowIndex = i + 1;
      prevTable = partData[i][19] || partData[i][18] || '';
      partRecord = partData[i];
      break;
    }
  }

  if (rowIndex === -1) throw new Error('Participant not found: ' + participantId);

  // Update table name column
  partSh.getRange(rowIndex, 20).setValue(newTableName);
  partSh.getRange(rowIndex, 25).setValue(new Date().toISOString());

  // Record assignment
  var assignId = 'ASN-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  assignSh.appendRow([
    assignId,
    newTableName,
    newTableName,
    participantId,
    partRecord[3] || '',
    partRecord[6] || '',
    'YES',
    prevTable,
    user || 'Admin',
    new Date().toISOString(),
    reason || 'Reassigned'
  ]);

  return {
    success: true,
    assignmentId: assignId,
    newTable: newTableName
  };
}

function computeLiveRankings(ss) {
  var participants = getSheetRecords(ss, 'Participants');
  var evaluations = getSheetRecords(ss, 'Evaluations').filter(function(e) { return e.Status === 'Submitted'; });
  var categories = getSheetRecords(ss, 'Categories');

  var rankings = [];

  participants.forEach(function(p) {
    var evals = evaluations.filter(function(e) { return e.ParticipantID === p.ParticipantID; });
    var count = evals.length;

    if (count > 0) {
      var sum = evals.reduce(function(acc, cur) { return acc + Number(cur.Total || 0); }, 0);
      var avg = Math.round((sum / count) * 100) / 100;
      var pct = Math.round(((avg / 40) * 100) * 100) / 100;

      rankings.push({
        participantId: p.ParticipantID,
        regNo: p.RegNo,
        title: p.Title,
        schoolName: p.SchoolName,
        category: p.Category,
        emirate: p.Emirate,
        table: p.TableName || p.TableID,
        leadName: p.LeadName,
        evaluationCount: count,
        totalScore: avg,
        maxScore: 40,
        percentage: pct,
        status: p.ProjectStatus || 'Active'
      });
    }
  });

  rankings.sort(function(a, b) {
    return b.percentage - a.percentage;
  });

  rankings.forEach(function(item, idx) {
    item.overallRank = idx + 1;
  });

  return {
    success: true,
    totalEvaluated: rankings.length,
    rankings: rankings
  };
}

function computeRegionalBreakdown(ss) {
  var participants = getSheetRecords(ss, 'Participants');
  var evaluations = getSheetRecords(ss, 'Evaluations').filter(function(e) { return e.Status === 'Submitted'; });

  var emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
  var breakdown = {};

  emirates.forEach(function(em) {
    var emParticipants = participants.filter(function(p) { return p.Emirate === em; });
    var projectScores = [];

    emParticipants.forEach(function(p) {
      var evals = evaluations.filter(function(e) { return e.ParticipantID === p.ParticipantID; });
      if (evals.length > 0) {
        var avg = evals.reduce(function(acc, e) { return acc + Number(e.Total || 0); }, 0) / evals.length;
        projectScores.push({
          participant: p,
          finalScore: Math.round(avg * 100) / 100,
          percentage: Math.round(((avg / 40) * 100) * 100) / 100,
          evalCount: evals.length
        });
      }
    });

    projectScores.sort(function(a, b) { return b.percentage - a.percentage; });

    breakdown[em] = {
      emirate: em,
      participantCount: emParticipants.length,
      evaluatedCount: projectScores.length,
      topProjects: projectScores.slice(0, 3)
    };
  });

  return {
    success: true,
    emirates: breakdown
  };
}

function computeJudgeActivity(ss) {
  var judges = getSheetRecords(ss, 'Judges');
  var evaluations = getSheetRecords(ss, 'Evaluations').filter(function(e) { return e.Status === 'Submitted'; });

  var activity = judges.map(function(j) {
    var myEvals = evaluations.filter(function(e) { return e.JudgeID === j.JudgeID; });
    var lastSubmitted = '';
    if (myEvals.length > 0) {
      myEvals.sort(function(a, b) { return new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime(); });
      lastSubmitted = myEvals[0].SubmittedAt;
    }
    return {
      judgeId: j.JudgeID,
      judgeName: j.Name,
      institution: j.Institution,
      categories: j.Categories,
      completedCount: myEvals.length,
      lastSubmittedAt: lastSubmitted
    };
  });

  return {
    success: true,
    activity: activity
  };
}

// -----------------------------------------------------------------------------
// EMAIL INTEGRATION & NOTIFICATION ENGINE
// -----------------------------------------------------------------------------

function getEmailQuota() {
  var quota = 0;
  try {
    quota = MailApp.getRemainingDailyQuota();
  } catch (e) {
    quota = -1;
  }
  return {
    success: true,
    remainingDailyQuota: quota,
    isGoogleWorkspace: quota > 100,
    timestamp: new Date().toISOString()
  };
}

function logEmailDispatch(ss, recipientEmail, recipientName, recipientRole, campaignType, subject, status, details, triggeredBy) {
  try {
    var sh = ss.getSheetByName('EmailLogs');
    if (!sh) {
      sh = ss.insertSheet('EmailLogs');
      sh.appendRow(['LogID','Timestamp','RecipientEmail','RecipientName','RecipientRole','CampaignType','Subject','Status','Details','TriggeredBy']);
    }
    var logId = 'LOG-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    sh.appendRow([
      logId,
      new Date().toISOString(),
      recipientEmail,
      recipientName,
      recipientRole,
      campaignType,
      subject,
      status,
      details,
      triggeredBy || 'Admin'
    ]);
  } catch (e) {
    // Non-fatal if logging fails
    console.error('Failed to log email: ' + e.message);
  }
}

function buildGMUResponsiveEmail(title, badgeText, introHtml, bodySectionsHtml, ctaText, ctaUrl, footerNote) {
  var year = new Date().getFullYear();
  return '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' + title + '</title>' +
    '</head>' +
    '<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">' +
    '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 24px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">' +
    
    // Header
    '<tr>' +
    '<td style="background: linear-gradient(135deg, #0B6E4F 0%, #064E3B 100%); padding: 32px 28px; text-align: center;">' +
    '<div style="color: #D4AF37; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">GULF MEDICAL UNIVERSITY &bull; AJMAN UAE</div>' +
    '<h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">MASE EXHIBITION 2026</h1>' +
    '<div style="display: inline-block; background-color: rgba(212, 175, 55, 0.2); border: 1px solid #D4AF37; color: #FEF08A; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 9999px; margin-top: 10px;">' + badgeText + '</div>' +
    '</td>' +
    '</tr>' +

    // Body
    '<tr>' +
    '<td style="padding: 32px 28px;">' +
    '<div style="font-size: 15px; line-height: 1.6; color: #334155;">' + introHtml + '</div>' +
    '<div style="margin: 24px 0;">' + bodySectionsHtml + '</div>' +
    (ctaUrl && ctaText ? 
      '<div style="text-align: center; margin: 32px 0 16px 0;">' +
      '<a href="' + ctaUrl + '" style="display: inline-block; background: linear-gradient(135deg, #0B6E4F 0%, #059669 100%); color: #FFFFFF; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(11, 110, 79, 0.3);">' + ctaText + ' &rarr;</a>' +
      '</div>' : '') +
    (footerNote ? '<p style="font-size: 12px; color: #64748B; text-align: center; margin-top: 20px; font-style: italic;">' + footerNote + '</p>' : '') +
    '</td>' +
    '</tr>' +

    // Footer
    '<tr>' +
    '<td style="background-color: #F1F5F9; padding: 20px 28px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">' +
    '<div><strong>Gulf Medical University (GMU)</strong> &bull; Medical and Science Exhibition</div>' +
    '<div style="margin-top: 4px;">Al Jurf 1, PO Box 4184, Ajman, United Arab Emirates</div>' +
    '<div style="margin-top: 6px; color: #94A3B8;">&copy; ' + year + ' GMU MASE Evaluation Committee. All rights reserved.</div>' +
    '</td>' +
    '</tr>' +

    '</table>' +
    '</td></tr>' +
    '</table>' +
    '</body></html>';
}

function sendTestEmail(ss, toEmail, userName) {
  if (!toEmail) return { success: false, message: 'Recipient email is required' };
  
  var name = userName || 'GMU MASE Administrator';
  var subject = '✅ GMU MASE 2026 - Email Dispatch Connection Verified';
  
  var introHtml = '<p>Hello <strong>' + name + '</strong>,</p>' +
    '<p>This test confirms that your <strong>Gulf Medical University MASE Google Apps Script Email Engine</strong> is operational and ready to send official exhibition notifications!</p>';

  var bodySections = '<table width="100%" style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; padding: 16px; margin: 16px 0;">' +
    '<tr><td>' +
    '<div style="font-size: 13px; font-weight: 700; color: #065F46; text-transform: uppercase;">System Health Status</div>' +
    '<div style="font-size: 14px; color: #047857; margin-top: 6px;">&bull; Google Apps Script: <strong>Active & Authorized</strong></div>' +
    '<div style="font-size: 14px; color: #047857;">&bull; Remaining Quota Today: <strong>' + MailApp.getRemainingDailyQuota() + ' emails</strong></div>' +
    '<div style="font-size: 14px; color: #047857;">&bull; Time: <strong>' + new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }) + ' (UAE Time)</strong></div>' +
    '</td></tr>' +
    '</table>';

  var html = buildGMUEmailWrapper('Test Email Verified', 'Backend Connected', introHtml, bodySections, '', '', 'Sent automatically by the GMU MASE Exhibition Management System');

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    htmlBody: html
  });

  logEmailDispatch(ss, toEmail, name, 'Admin', 'Test Connection', subject, 'Sent', 'Quota remaining: ' + MailApp.getRemainingDailyQuota(), 'Admin Console');

  return {
    success: true,
    message: 'Test email successfully dispatched to ' + toEmail,
    remainingQuota: MailApp.getRemainingDailyQuota()
  };
}

function sendSingleJudgeInvite(ss, judgeId, portalUrl, customNote) {
  var judges = getSheetRecords(ss, 'Judges');
  var auth = getSheetRecords(ss, 'JudgeAuth');

  var judge = judges.find(function(j) { return j.JudgeID === judgeId; });
  if (!judge) return { success: false, message: 'Judge ' + judgeId + ' not found' };
  if (!judge.Email) return { success: false, message: 'No email found for ' + judge.Name };

  var judgeAuth = auth.find(function(a) { return a.JudgeID === judgeId; });
  var accessCode = judgeAuth ? judgeAuth.AccessCode : 'GMU-JUDGE-2026';
  var targetPortalUrl = portalUrl || 'https://your-github-repo.github.io/gmu-mase-judging/';

  var subject = '⚖️ GMU MASE 2026: Official Judge Portal Credentials & Scoring Schedule';

  var introHtml = '<p>Dear <strong>' + judge.Name + '</strong>,</p>' +
    '<p>Thank you for serving as a Distinguished Juror for the <strong>Gulf Medical University Medical and Science Exhibition (MASE) 2026</strong>. ' +
    'Your expertise ensures fair, rigorous evaluation of student innovators across the UAE.</p>';

  var bodySections = 
    '<div style="background-color: #FEF9C3; border: 1px solid #FDE047; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">' +
    '<div style="font-size: 11px; font-weight: 800; color: #854D0E; letter-spacing: 1.5px; text-transform: uppercase;">Your Private Judge Access Code</div>' +
    '<div style="font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #1E293B; margin: 8px 0; font-family: monospace;">' + accessCode + '</div>' +
    '<div style="font-size: 12px; color: #713F12;">Enter this code on the Live Judging Portal to begin scoring assigned tables.</div>' +
    '</div>' +

    '<table width="100%" style="border-collapse: collapse; margin-top: 16px; font-size: 13px;">' +
    '<tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; color: #64748B;">Assigned Categories:</td><td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0B6E4F;">' + (judge.Categories || 'All Categories') + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; color: #64748B;">Academic Institution:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">' + (judge.Institution || 'Gulf Medical University') + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; color: #64748B;">Scoring Criteria:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">Theme, Knowledge, Creativity, Presentation (40 pts)</td></tr>' +
    '</table>' +

    (customNote ? '<div style="margin-top: 16px; padding: 12px; background: #F8FAFC; border-left: 3px solid #0B6E4F; font-size: 13px; color: #334155;"><strong>Special Note:</strong> ' + customNote + '</div>' : '');

  var html = buildGMUEmailWrapper('Judge Access Credentials', 'Official Juror Invitation', introHtml, bodySections, 'Open Judge Portal', targetPortalUrl, 'Please keep your access code confidential. All scoring is encrypted and synchronized in real-time.');

  MailApp.sendEmail({
    to: judge.Email,
    subject: subject,
    htmlBody: html
  });

  logEmailDispatch(ss, judge.Email, judge.Name, 'Judge', 'Judge Invitation', subject, 'Sent', 'Code: ' + accessCode, 'Admin');

  return {
    success: true,
    judgeName: judge.Name,
    email: judge.Email,
    accessCode: accessCode,
    message: 'Invitation sent to ' + judge.Email
  };
}

function sendBatchJudgeInvites(ss, judgeIds, portalUrl, customNote) {
  var judges = getSheetRecords(ss, 'Judges');
  var targetJudges = judges;

  if (judgeIds && judgeIds.length > 0) {
    targetJudges = judges.filter(function(j) { return judgeIds.indexOf(j.JudgeID) !== -1; });
  }

  var results = [];
  var sentCount = 0;
  var failCount = 0;

  targetJudges.forEach(function(j) {
    try {
      var res = sendSingleJudgeInvite(ss, j.JudgeID, portalUrl, customNote);
      if (res.success) {
        sentCount++;
        results.push({ judgeId: j.JudgeID, name: j.Name, status: 'Sent' });
      } else {
        failCount++;
        results.push({ judgeId: j.JudgeID, name: j.Name, status: 'Failed: ' + res.message });
      }
    } catch (e) {
      failCount++;
      results.push({ judgeId: j.JudgeID, name: j.Name, status: 'Error: ' + e.message });
    }
    // Respect rate limit
    Utilities.sleep(400);
  });

  return {
    success: true,
    totalAttempted: targetJudges.length,
    sentCount: sentCount,
    failCount: failCount,
    remainingQuota: MailApp.getRemainingDailyQuota(),
    results: results
  };
}

function sendSingleResultNotification(ss, participantId, portalUrl, customNote) {
  var participants = getSheetRecords(ss, 'Participants');
  var evaluations = getSheetRecords(ss, 'Evaluations').filter(function(e) { return e.Status === 'Submitted'; });

  var part = participants.find(function(p) { return p.ParticipantID === participantId; });
  if (!part) return { success: false, message: 'Participant ' + participantId + ' not found' };

  var targetEmail = part.Email || part.SupervisorContact;
  if (!targetEmail || targetEmail.indexOf('@') === -1) {
    return { success: false, message: 'No valid email found for project ' + part.Title };
  }

  var myEvals = evaluations.filter(function(e) { return e.ParticipantID === participantId; });
  var avgScore = 0;
  var percentage = 0;
  if (myEvals.length > 0) {
    var sum = myEvals.reduce(function(acc, cur) { return acc + Number(cur.Total || 0); }, 0);
    avgScore = Math.round((sum / myEvals.length) * 100) / 100;
    percentage = Math.round(((avgScore / 40) * 100) * 100) / 100;
  }

  var subject = '🏆 GMU MASE 2026: Official Exhibition Results & Performance Summary - ' + part.Title;

  var introHtml = '<p>Dear <strong>' + (part.LeadName || 'Student Team') + '</strong> & Supervisor <strong>' + (part.Supervisor || '') + '</strong>,</p>' +
    '<p>The Jury Panel has finalized the evaluations for the <strong>Gulf Medical University MASE Exhibition 2026</strong>. ' +
    'We are delighted to present your official evaluation summary below.</p>';

  var bodySections = 
    '<div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">' +
    '<div style="font-size: 11px; font-weight: 800; color: #065F46; letter-spacing: 1.5px; text-transform: uppercase;">Overall Exhibition Score</div>' +
    '<div style="font-size: 32px; font-weight: 900; color: #0B6E4F; margin: 6px 0;">' + percentage + '%</div>' +
    '<div style="font-size: 13px; color: #047857; font-weight: 600;">' + avgScore + ' out of 40 Points &bull; Evaluated by ' + myEvals.length + ' Jurors</div>' +
    '</div>' +

    '<table width="100%" style="border-collapse: collapse; font-size: 13px;">' +
    '<tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; color: #64748B;">Project Title:</td><td style="padding: 8px 0; font-weight: 700; text-align: right; color: #1E293B;">' + part.Title + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; color: #64748B;">School / Institution:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">' + part.SchoolName + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; color: #64748B;">Emirate:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">' + part.Emirate + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; color: #64748B;">Category:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">' + part.Category + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; color: #64748B;">Table Number:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">' + (part.TableName || part.TableID) + '</td></tr>' +
    '</table>' +

    (customNote ? '<div style="margin-top: 16px; padding: 12px; background: #F8FAFC; border-left: 3px solid #D4AF37; font-size: 13px; color: #334155;"><strong>Awards Ceremony Notice:</strong> ' + customNote + '</div>' : '');

  var html = buildGMUEmailWrapper('Exhibition Results', 'Official Award Report', introHtml, bodySections, 'View Live Leaderboard', portalUrl || '', 'Certificate generation will be made available following the GMU Grand Hall Awards Ceremony.');

  MailApp.sendEmail({
    to: targetEmail,
    subject: subject,
    htmlBody: html
  });

  logEmailDispatch(ss, targetEmail, part.LeadName || part.SchoolName, 'Participant', 'Results Announcement', subject, 'Sent', 'Score: ' + percentage + '%', 'Admin');

  return {
    success: true,
    participantId: participantId,
    recipient: targetEmail,
    percentage: percentage,
    message: 'Results sent to ' + targetEmail
  };
}

function sendBatchResultNotifications(ss, participantIds, portalUrl, customNote) {
  var participants = getSheetRecords(ss, 'Participants');
  var targetParticipants = participants;

  if (participantIds && participantIds.length > 0) {
    targetParticipants = participants.filter(function(p) { return participantIds.indexOf(p.ParticipantID) !== -1; });
  }

  var sentCount = 0;
  var failCount = 0;
  var details = [];

  targetParticipants.forEach(function(p) {
    try {
      var res = sendSingleResultNotification(ss, p.ParticipantID, portalUrl, customNote);
      if (res.success) {
        sentCount++;
        details.push({ id: p.ParticipantID, status: 'Sent' });
      } else {
        failCount++;
        details.push({ id: p.ParticipantID, status: 'Failed: ' + res.message });
      }
    } catch (e) {
      failCount++;
      details.push({ id: p.ParticipantID, status: 'Error: ' + e.message });
    }
    Utilities.sleep(400);
  });

  return {
    success: true,
    totalAttempted: targetParticipants.length,
    sentCount: sentCount,
    failCount: failCount,
    remainingQuota: MailApp.getRemainingDailyQuota(),
    details: details
  };
}

function sendCustomAnnouncement(ss, audience, subject, messageBody, ctaText, ctaUrl) {
  if (!subject || !messageBody) {
    return { success: false, message: 'Subject and message body are required' };
  }

  var recipients = [];

  if (audience === 'judges' || audience === 'all') {
    var judges = getSheetRecords(ss, 'Judges');
    judges.forEach(function(j) {
      if (j.Email && j.Email.indexOf('@') !== -1) {
        recipients.push({ email: j.Email, name: j.Name, role: 'Judge' });
      }
    });
  }

  if (audience === 'schools' || audience === 'all') {
    var schools = getSheetRecords(ss, 'Schools');
    schools.forEach(function(s) {
      if (s.RepEmail && s.RepEmail.indexOf('@') !== -1) {
        recipients.push({ email: s.RepEmail, name: s.RepName || s.Name, role: 'School Rep' });
      }
    });
  }

  if (audience === 'participants' || audience === 'all') {
    var participants = getSheetRecords(ss, 'Participants');
    participants.forEach(function(p) {
      if (p.Email && p.Email.indexOf('@') !== -1) {
        recipients.push({ email: p.Email, name: p.LeadName || p.Title, role: 'Student Team' });
      }
    });
  }

  // Deduplicate emails
  var seen = {};
  var uniqueRecipients = [];
  recipients.forEach(function(r) {
    var normalized = r.email.toLowerCase().trim();
    if (!seen[normalized]) {
      seen[normalized] = true;
      uniqueRecipients.push(r);
    }
  });

  var sentCount = 0;
  var failCount = 0;

  uniqueRecipients.forEach(function(r) {
    try {
      var intro = '<p>Dear <strong>' + r.name + '</strong>,</p>' +
        '<div style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 12px;">' + messageBody.replace(/\n/g, '<br>') + '</div>';

      var html = buildGMUEmailWrapper(subject, 'Official Broadcast', intro, '', ctaText || 'View Exhibition Portal', ctaUrl || '', 'This is an official announcement from Gulf Medical University MASE Committee.');

      MailApp.sendEmail({
        to: r.email,
        subject: subject,
        htmlBody: html
      });

      sentCount++;
      logEmailDispatch(ss, r.email, r.name, r.role, 'Broadcast Announcement', subject, 'Sent', 'Audience: ' + audience, 'Admin');
    } catch (e) {
      failCount++;
      logEmailDispatch(ss, r.email, r.name, r.role, 'Broadcast Announcement', subject, 'Failed', e.message, 'Admin');
    }
    Utilities.sleep(350);
  });

  return {
    success: true,
    totalAttempted: uniqueRecipients.length,
    sentCount: sentCount,
    failCount: failCount,
    remainingQuota: MailApp.getRemainingDailyQuota()
  };
}

// -----------------------------------------------------------------------------
// CORS & JSON RESPONSE BUILDER
// -----------------------------------------------------------------------------
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper alias
function buildGMUEmailWrapper(title, badgeText, introHtml, bodySectionsHtml, ctaText, ctaUrl, footerNote) {
  return buildGMUResponsiveEmail(title, badgeText, introHtml, bodySectionsHtml, ctaText, ctaUrl, footerNote);
}
