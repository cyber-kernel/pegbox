'use client';

import { useState, useEffect } from 'react';
import { MANIFESTS, loadTool } from '@/lib/registry.generated';
import {
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Cpu,
  RefreshCw,
  Server,
  Layers,
  Terminal,
  Lock,
  LogOut,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

interface TestResult {
  toolId: string;
  toolName: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  durationMs?: number;
  error?: string;
  diagnostics?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [disabledTools, setDisabledTools] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [copied, setCopied] = useState(false);

  // Environment specs
  const [envInfo, setEnvInfo] = useState<{
    wasm: boolean;
    worker: boolean;
    crossOriginIsolated: boolean;
    userAgent: string;
  }>({
    wasm: false,
    worker: false,
    crossOriginIsolated: false,
    userAgent: '',
  });

  // Check initial authentication
  useEffect(() => {
    fetch('/api/admin/check')
      .then((r) => r.json())
      .then((d) => {
        setIsAuthenticated(Boolean(d.authenticated));
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Fetch flags
    fetch('/api/flags')
      .then((r) => r.json())
      .then((data) => {
        if (data.disabledTools) setDisabledTools(data.disabledTools);
      })
      .catch(() => {});

    // 2. Inspect Client Environment
    if (typeof window !== 'undefined') {
      setEnvInfo({
        wasm: typeof WebAssembly !== 'undefined',
        worker: typeof Worker !== 'undefined',
        crossOriginIsolated: window.crossOriginIsolated || false,
        userAgent: navigator.userAgent,
      });
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login request failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setPassword('');
  };

  const runSingleSelfTest = async (toolId: string) => {
    const manifest = MANIFESTS.find((m) => m.id === toolId);
    if (!manifest) return;

    setTestResults((prev) => ({
      ...prev,
      [toolId]: {
        toolId,
        toolName: manifest.name,
        status: 'running',
      },
    }));

    const t0 = performance.now();
    try {
      const toolMod = await loadTool(toolId);
      if (!toolMod) throw new Error('Could not load tool module');

      let selftestMod: any;
      if (toolId === 'voice-cleaner') {
        selftestMod = await import('tools/voice-cleaner/selftest');
      } else if (toolId === 'silence-cutter') {
        selftestMod = await import('tools/silence-cutter/selftest');
      } else {
        throw new Error(`Self-test not implemented for ${toolId}`);
      }

      const fixture = await selftestMod.makeFixture();
      const engine = await toolMod.load();

      const res = await engine.run({
        files: fixture,
        preset: manifest.presets[0]?.id || 'default',
        options: {},
        onProgress: () => {},
        signal: new AbortController().signal,
        log: () => {},
      });

      const checkErr = selftestMod.check(res);
      const durationMs = Math.round(performance.now() - t0);

      if (checkErr) {
        setTestResults((prev) => ({
          ...prev,
          [toolId]: {
            toolId,
            toolName: manifest.name,
            status: 'fail',
            durationMs,
            error: checkErr,
          },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [toolId]: {
            toolId,
            toolName: manifest.name,
            status: 'pass',
            durationMs,
            diagnostics: JSON.stringify(res.diagnostics || res.stats || {}),
          },
        }));
      }
    } catch (e: any) {
      const durationMs = Math.round(performance.now() - t0);
      setTestResults((prev) => ({
        ...prev,
        [toolId]: {
          toolId,
          toolName: manifest.name,
          status: 'fail',
          durationMs,
          error: e.message || String(e),
        },
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    for (const m of MANIFESTS) {
      await runSingleSelfTest(m.id);
    }
    setIsRunningAll(false);
  };

  const copyResults = () => {
    const lines = [
      `### Pegbox Self-Test Run (${new Date().toISOString()})`,
      `- Environment: WASM=${envInfo.wasm}, Worker=${envInfo.worker}, Isolated=${envInfo.crossOriginIsolated}`,
      `- User Agent: ${envInfo.userAgent}`,
      '',
      '| Tool | Status | Duration | Notes |',
      '|---|---|---|---|',
    ];

    for (const m of MANIFESTS) {
      const res = testResults[m.id];
      if (!res) {
        lines.push(`| ${m.name} | Not Run | - | - |`);
      } else {
        lines.push(
          `| ${res.toolName} | ${res.status.toUpperCase()} | ${res.durationMs || 0} ms | ${
            res.error ? `Error: ${res.error}` : 'Passed'
          } |`
        );
      }
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-surface border border-line rounded-card p-6 sm:p-8 space-y-6 shadow-card">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-ink">Pegbox Admin Console</h1>
            <p className="text-xs text-muted">
              Enter the <code className="font-mono text-ink">ADMIN_USER</code> and{' '}
              <code className="font-mono text-ink">ADMIN_PASSWORD</code> from your environment.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-control bg-danger-bg border border-danger-text/20 text-danger-text text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted font-mono block">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-bg border border-line rounded-control text-sm text-ink focus:border-primary focus:outline-none"
                placeholder="admin"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted font-mono block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-bg border border-line rounded-control text-sm text-ink focus:border-primary focus:outline-none"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-control text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              Unlock Console
            </button>
          </form>

          <div className="text-center pt-2 border-t border-line">
            <span className="text-[11px] text-muted">
              Pegbox Founder Console · 100% Client-Side Architecture
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Console
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 space-y-10 w-full">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-primary/10 text-primary text-xs font-mono font-semibold">
            Founder Console
          </div>
          <h1 className="font-heading font-bold text-3xl text-ink">
            Pegbox Health & Diagnostics
          </h1>
          <p className="text-xs text-muted">
            Registry inventory, browser-native self-test harness, and runtime verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={runAllTests}
            disabled={isRunningAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-control text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRunningAll ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            Run All Browser Self-Tests
          </button>
          <button
            type="button"
            onClick={copyResults}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-2 border border-line text-ink rounded-control text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success-text" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
            Copy Results
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-danger-bg text-muted hover:text-danger-text border border-line rounded-control text-xs font-medium transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </div>

      {/* 1. Client Environment & Feature Detection */}
      <section className="space-y-3">
        <h2 className="font-heading font-bold text-lg text-ink flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <span>Client Capabilities & Isolation</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-control bg-surface border border-line">
            <span className="text-[11px] font-mono uppercase text-muted block mb-1">WebAssembly</span>
            <span className={`text-sm font-semibold ${envInfo.wasm ? 'text-success-text' : 'text-danger-text'}`}>
              {envInfo.wasm ? '✓ Supported' : '✗ Unavailable'}
            </span>
          </div>
          <div className="p-4 rounded-control bg-surface border border-line">
            <span className="text-[11px] font-mono uppercase text-muted block mb-1">Web Workers</span>
            <span className={`text-sm font-semibold ${envInfo.worker ? 'text-success-text' : 'text-danger-text'}`}>
              {envInfo.worker ? '✓ Supported' : '✗ Unavailable'}
            </span>
          </div>
          <div className="p-4 rounded-control bg-surface border border-line">
            <span className="text-[11px] font-mono uppercase text-muted block mb-1">Cross-Origin Isolation</span>
            <span className="text-sm font-semibold text-ink">
              {envInfo.crossOriginIsolated ? 'Isolated (COOP/COEP)' : 'Standard (No Headers)'}
            </span>
          </div>
          <div className="p-4 rounded-control bg-surface border border-line">
            <span className="text-[11px] font-mono uppercase text-muted block mb-1">FFmpeg Core</span>
            <span className="text-sm font-semibold text-ink">0.12.10 (Single-Thread)</span>
          </div>
        </div>
      </section>

      {/* 2. Self-Test Results Table */}
      <section className="space-y-3">
        <h2 className="font-heading font-bold text-lg text-ink flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <span>In-Browser Self-Test Runner</span>
        </h2>
        <div className="border border-line rounded-card overflow-hidden bg-bg shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-line text-muted font-mono uppercase">
              <tr>
                <th className="py-3 px-4">Tool</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Test Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {MANIFESTS.map((m) => {
                const res = testResults[m.id];
                return (
                  <tr key={m.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-ink">
                      <div>{m.name}</div>
                      <div className="text-[11px] text-muted font-mono font-normal">/{m.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted">{m.category}</td>
                    <td className="py-3.5 px-4">
                      {!res && <span className="text-muted">Not run</span>}
                      {res?.status === 'running' && (
                        <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running…
                        </span>
                      )}
                      {res?.status === 'pass' && (
                        <span className="inline-flex items-center gap-1 text-success-text font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Passed
                        </span>
                      )}
                      {res?.status === 'fail' && (
                        <span className="inline-flex items-center gap-1 text-danger-text font-semibold" title={res.error}>
                          <XCircle className="w-4 h-4" /> Failed: {res.error}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted">
                      {res?.durationMs !== undefined ? `${res.durationMs} ms` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => runSingleSelfTest(m.id)}
                        disabled={res?.status === 'running'}
                        className="px-2.5 py-1 bg-surface hover:bg-surface-2 border border-line rounded text-ink text-[11px] font-medium transition-colors"
                      >
                        Run Test
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Tool Registry & Kill-Switch State */}
      <section className="space-y-3">
        <h2 className="font-heading font-bold text-lg text-ink flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <span>Registry Inventory & Kill Switch</span>
        </h2>
        <div className="border border-line rounded-card overflow-hidden bg-bg shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-line text-muted font-mono uppercase">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Runtime</th>
                <th className="py-3 px-4">Input Extensions</th>
                <th className="py-3 px-4">Max MB</th>
                <th className="py-3 px-4">Production Kill-Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {MANIFESTS.map((m) => {
                const isDisabled = disabledTools.includes(m.id);
                return (
                  <tr key={m.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-ink">{m.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-pill bg-surface-2 text-ink text-[10px] font-mono">
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted">{m.runtime}</td>
                    <td className="py-3 px-4 text-muted font-mono">{m.input.extensions.join(', ')}</td>
                    <td className="py-3 px-4 font-mono text-muted">{m.input.maxMB} MB</td>
                    <td className="py-3 px-4">
                      {isDisabled ? (
                        <span className="px-2 py-0.5 rounded-pill bg-danger-bg text-danger-text text-[10px] font-bold">
                          PAUSED (Flag Active)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-pill bg-success-bg text-success-text text-[10px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
