import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileCode, 
  ArrowRight, 
  Scan, 
  Shield, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  X,
  HelpCircle,
  Unlock
} from 'lucide-react';
import { extractTextFromPDF, parseTaxDocumentText, parseTISJSON } from '../utils/documentParser';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

export default function DocumentUploader({ onScanComplete, currentData, activeSampleId, setActiveSampleId }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Password-protected PDF Modal State
  const [pendingFile, setPendingFile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Helper Assistant inputs for quick ITD password construction
  const [helperPan, setHelperPan] = useState(currentData?.pan || '');
  const [helperDob, setHelperDob] = useState('');

  const processFile = async (file, password = '') => {
    if (!file) return;
    setIsScanning(true);
    setScanProgress(15);
    setScanMessage(`Analyzing ${file.name}...`);

    try {
      let extractedData = null;

      // 1. JSON direct export from Income Tax Portal
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        setScanProgress(45);
        setScanMessage('Parsing JSON schema & TIS categories...');
        const text = await file.text();
        extractedData = parseTISJSON(text, file.name);
      } 
      // 2. PDF Document (with password support)
      else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        setScanProgress(30);
        setScanMessage(password ? 'Decrypting PDF with provided password...' : 'Checking PDF security & text coordinates...');
        
        const pdfResult = await extractTextFromPDF(file, password);

        if (!pdfResult.success && pdfResult.requiresPassword) {
          setIsScanning(false);
          setScanProgress(0);
          setScanMessage('');
          setPendingFile(file);
          setShowPasswordModal(true);
          if (password) {
            setPasswordError('Incorrect password. Please verify your PAN and Date of Birth / Incorporation.');
          } else {
            setPasswordError('');
          }
          return;
        }

        setScanProgress(65);
        setScanMessage('Extracting PAN, AIS codes (S-001, I-001, TDS) and financial figures...');
        extractedData = parseTaxDocumentText(pdfResult.text, file.name, pdfResult.lines);
      } 
      // 3. Plain Text / CSV / XML
      else {
        setScanProgress(40);
        setScanMessage('Scanning plain text & regex token patterns...');
        const text = await file.text();
        extractedData = parseTaxDocumentText(text, file.name, text.split('\n'));
      }

      setScanProgress(85);
      setScanMessage('Computing tax eligibility rules and tax slabs...');
      await new Promise(r => setTimeout(r, 350));

      setScanProgress(100);
      setActiveSampleId(null);
      
      // Close password modal if open
      setShowPasswordModal(false);
      setPendingFile(null);
      setPdfPassword('');
      setPasswordError('');

      if (extractedData) {
        onScanComplete(extractedData);
      } else {
        alert('Could not parse tax data from this document. Please ensure it is a valid TIS / AIS / Form 16 / ITR document.');
      }
    } catch (err) {
      console.error('Scan error:', err);
      alert('Failed to process document: ' + (err.message || 'Unknown error'));
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setScanMessage('');
      setIsUnlocking(false);
    }
  };

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    if (!pdfPassword) {
      setPasswordError('Please enter the document password.');
      return;
    }
    setIsUnlocking(true);
    setPasswordError('');
    processFile(pendingFile, pdfPassword);
  };

  const handleAutoFillITDPassword = (mode = 'lower') => {
    if (!helperPan || !helperDob) {
      setPasswordError('Please provide both PAN and Date of Birth to generate ITD password.');
      return;
    }
    // Clean DOB: Remove any dashes or slashes -> DDMMYYYY
    const cleanDob = helperDob.replace(/[^0-9]/g, '');
    const cleanPan = helperPan.trim().replace(/[^a-zA-Z0-9]/g, '');
    
    const formatted = mode === 'lower' 
      ? `${cleanPan.toLowerCase()}${cleanDob}`
      : `${cleanPan.toUpperCase()}${cleanDob}`;
      
    setPdfPassword(formatted);
    setPasswordError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const loadSample = (sample) => {
    setIsScanning(true);
    setScanProgress(20);
    setScanMessage(`Loading sample: ${sample.title}...`);
    setActiveSampleId(sample.id);

    setTimeout(() => {
      setScanProgress(60);
      setScanMessage('Parsing simulated TIS categories & Form 26AS credits...');
    }, 200);

    setTimeout(() => {
      setScanProgress(100);
      onScanComplete({ ...sample.data });
      setIsScanning(false);
      setScanProgress(0);
      setScanMessage('');
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.json,.csv,.txt,.xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Scanner Laser Animation */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
            {isScanning ? (
              <Scan className="w-8 h-8 animate-spin text-emerald-400" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
              <span>{isScanning ? 'Scanning Document...' : 'Upload TIS, AIS, Form 16, or ITR Document'}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                <Lock className="w-3 h-3 text-amber-400" /> Password-Protected Supported
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
              Drag & drop your Taxpayer Information Summary (TIS), AIS, or Form 26AS in{' '}
              <span className="text-slate-300 font-mono">PDF, JSON, or CSV</span>. Encrypted PDFs are unlocked locally.
            </p>
          </div>

          {/* Scan Progress Bar */}
          {isScanning ? (
            <div className="w-full max-w-xs space-y-2 pt-2">
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-emerald-400 font-medium animate-pulse">{scanMessage}</p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                <Shield className="w-3 h-3 text-emerald-400" /> 100% Client-Side Decryption
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                <KeyRound className="w-3 h-3 text-amber-400" /> ITD Password Format Assistant
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Auto-Detects PAN & Codes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Test Drive Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Or Try Ready-Made Sample Documents (1-Click Test Drive)
            </h4>
          </div>
          <span className="text-xs text-slate-500">6 Real-World Taxpayer Scenarios</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAMPLE_DOCUMENTS.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 group relative ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sample.badgeColor}`}>
                    {sample.tag}
                  </span>
                  {isSelected && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>
                <h5 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {sample.title}
                </h5>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {sample.subtitle}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">PAN: {sample.data.pan}</span>
                  <span className="flex items-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                    Load & Scan <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PASSWORD UNLOCK MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Encrypted PDF Detected</h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                    {pendingFile?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPendingFile(null);
                  setPdfPassword('');
                  setPasswordError('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUnlockSubmit} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Enter PDF Password</span>
                  <span className="text-[10px] text-slate-400">Decrypted 100% locally</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    placeholder="e.g. abcde1234f01011990"
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Income Tax Standard Password Assistant */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Income Tax Default Format
                  </div>
                  <span className="text-[10px] text-slate-500">TIS / AIS / Form 16 / e-PAN</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Income Tax Department PDFs are password-protected using your{' '}
                  <strong className="text-slate-200">PAN + Date of Birth / Incorporation</strong> in{' '}
                  <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">DDMMYYYY</code> format.
                </p>

                {/* Quick Auto-Builder Helper */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Taxpayer PAN</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={helperPan}
                      onChange={(e) => setHelperPan(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs font-mono uppercase text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">DOB / DOI (DDMMYYYY)</label>
                    <input
                      type="text"
                      maxLength={8}
                      value={helperDob}
                      onChange={(e) => setHelperDob(e.target.value)}
                      placeholder="01011990"
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAutoFillITDPassword('lower')}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-[11px] font-medium text-slate-300 transition-colors"
                  >
                    Use Lowercase: <span className="font-mono text-emerald-400">pan+dob</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoFillITDPassword('upper')}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-[11px] font-medium text-slate-300 transition-colors"
                  >
                    Use Uppercase: <span className="font-mono text-emerald-400">PAN+dob</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPendingFile(null);
                    setPdfPassword('');
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUnlocking}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {isUnlocking ? (
                    <>
                      <Scan className="w-3.5 h-3.5 animate-spin" />
                      <span>Decrypting & Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock & Scan PDF</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
