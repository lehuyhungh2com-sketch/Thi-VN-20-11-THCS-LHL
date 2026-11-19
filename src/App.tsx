import { useEffect, useMemo, useState } from 'react';
import { CriteriaAssignmentPanel } from './components/CriteriaAssignmentPanel';
import { EventMasthead } from './components/EventMasthead';
import { JuryView, RulesView } from './components/JuryAndRulesView';
import { PrintSheet } from './components/PrintSheet';
import { QuickEntryPanel } from './components/QuickEntryPanel';
import { ScoringTable } from './components/ScoringTable';
import { StandingsView } from './components/StandingsView';
import { TopBar } from './components/TopBar';
import {
  DEFAULT_CONFIG,
  DEFAULT_CRITERIA,
  DEFAULT_EVENT_META,
  DEFAULT_JUDGES,
  DEFAULT_JUDGE_CRITERIA,
  DEFAULT_PRIZE_CONFIG,
  INITIAL_PERFORMANCES,
  SAMPLE_RATIO_BY_STT,
} from './data/initialData';
import {
  ActiveTab,
  CriterionId,
  CriterionInfo,
  EventMetadata,
  JudgeId,
  JudgeInfo,
  PerformanceItem,
  PrizeConfig,
  ScoringConfig,
} from './types/scoring';
import {
  evaluatePerformances,
  exportBackupJson,
  exportToCsv,
  getJudgeMaxScore,
  parseBackupJson,
  parseScoreInput,
  roundScore,
} from './utils/scoring';

const STORAGE_KEYS = {
  performances: 'thcs-lhl-2011-performances-v3',
  config: 'thcs-lhl-2011-config-v3',
  judges: 'thcs-lhl-2011-judges-v1',
  criteria: 'thcs-lhl-2011-criteria-v1',
  eventMeta: 'thcs-lhl-2011-meta-v1',
  prizeConfig: 'thcs-lhl-2011-prizes-v1',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [performances, setPerformances] = useState<PerformanceItem[]>(() => {
    const loaded = loadJson<PerformanceItem[]>(STORAGE_KEYS.performances, INITIAL_PERFORMANCES);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : INITIAL_PERFORMANCES;
  });

  const [judges, setJudges] = useState<JudgeInfo[]>(() => {
    const loaded = loadJson<JudgeInfo[]>(STORAGE_KEYS.judges, DEFAULT_JUDGES);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : DEFAULT_JUDGES;
  });

  const [criteria, setCriteria] = useState<CriterionInfo[]>(() => {
    const loaded = loadJson<CriterionInfo[]>(STORAGE_KEYS.criteria, DEFAULT_CRITERIA);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : DEFAULT_CRITERIA;
  });

  const [eventMeta, setEventMeta] = useState<EventMetadata>(() => ({
    ...DEFAULT_EVENT_META,
    ...loadJson<Partial<EventMetadata>>(STORAGE_KEYS.eventMeta, {}),
  }));

  const [prizeConfig, setPrizeConfig] = useState<PrizeConfig>(() => ({
    ...DEFAULT_PRIZE_CONFIG,
    ...loadJson<Partial<PrizeConfig>>(STORAGE_KEYS.prizeConfig, {}),
  }));

  const [config, setConfig] = useState<ScoringConfig>(() => {
    const loaded = loadJson<Partial<ScoringConfig>>(STORAGE_KEYS.config, {});
    return {
      ...DEFAULT_CONFIG,
      ...loaded,
      judgeCriteria: loaded.judgeCriteria ?? DEFAULT_JUDGE_CRITERIA,
    };
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('ledger');
  const [selectedId, setSelectedId] = useState<string>(() => performances[0]?.id ?? 'tm-01');
  const [criteriaPanelOpen, setCriteriaPanelOpen] = useState<boolean>(false);
  const [quickEntryOpen, setQuickEntryOpen] = useState<boolean>(true);
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});
  const [backupNotice, setBackupNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!backupNotice) return;
    const timer = window.setTimeout(() => setBackupNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [backupNotice]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.performances, JSON.stringify(performances));
    } catch {
      // Ignore quota errors
    }
  }, [performances]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
    } catch {
      // Ignore quota errors
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.judges, JSON.stringify(judges));
    } catch {
      // Ignore quota errors
    }
  }, [judges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.criteria, JSON.stringify(criteria));
    } catch {
      // Ignore quota errors
    }
  }, [criteria]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.eventMeta, JSON.stringify(eventMeta));
    } catch {
      // Ignore quota errors
    }
  }, [eventMeta]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.prizeConfig, JSON.stringify(prizeConfig));
    } catch {
      // Ignore quota errors
    }
  }, [prizeConfig]);

  const evaluated = useMemo(
    () =>
      evaluatePerformances(
        performances,
        judges,
        config,
        prizeConfig,
        eventMeta.bonusPoints
      ),
    [performances, judges, config, prizeConfig, eventMeta.bonusPoints]
  );

  const handleScoreInputChange = (perfId: string, judgeId: JudgeId, raw: string) => {
    const cleaned = raw.replace(/[^0-9.,]/g, '');
    const draftKey = `${perfId}-${judgeId}`;
    const maxScore = getJudgeMaxScore(judgeId, config.judgeCriteria, criteria);

    setDraftScores((prev) => ({ ...prev, [draftKey]: cleaned }));

    if (cleaned.trim() === '') {
      setPerformances((prev) =>
        prev.map((item) =>
          item.id === perfId
            ? { ...item, scores: { ...item.scores, [judgeId]: null } }
            : item
        )
      );
      return;
    }

    const normalized = cleaned.replace(',', '.');
    if (!normalized.endsWith('.')) {
      const parsed = parseScoreInput(cleaned, maxScore);
      if (parsed !== null) {
        setPerformances((prev) =>
          prev.map((item) =>
            item.id === perfId
              ? { ...item, scores: { ...item.scores, [judgeId]: parsed } }
              : item
          )
        );
      }
    }
  };

  const handleScoreInputBlur = (perfId: string, judgeId: JudgeId) => {
    const draftKey = `${perfId}-${judgeId}`;
    const raw = draftScores[draftKey];
    const maxScore = getJudgeMaxScore(judgeId, config.judgeCriteria, criteria);

    if (raw !== undefined) {
      const parsed = parseScoreInput(raw, maxScore);
      setPerformances((prev) =>
        prev.map((item) =>
          item.id === perfId
            ? { ...item, scores: { ...item.scores, [judgeId]: parsed } }
            : item
        )
      );
      setDraftScores((prev) => {
        const next = { ...prev };
        delete next[draftKey];
        return next;
      });
    }
  };

  const handleUpdateClassName = (perfId: string, value: string) => {
    setPerformances((prev) =>
      prev.map((item) => (item.id === perfId ? { ...item, className: value } : item))
    );
  };

  const handleUpdatePerformanceName = (perfId: string, value: string) => {
    setPerformances((prev) =>
      prev.map((item) =>
        item.id === perfId ? { ...item, performanceName: value } : item
      )
    );
  };

  const handleToggleTeacherTheme = (perfId: string) => {
    setPerformances((prev) =>
      prev.map((item) =>
        item.id === perfId ? { ...item, isTeacherTheme: !item.isTeacherTheme } : item
      )
    );
  };

  const handleAddPerformance = () => {
    setPerformances((prev) => {
      const nextStt = prev.length > 0 ? Math.max(...prev.map((p) => p.stt)) + 1 : 1;
      const newId = `tm-${Date.now()}`;
      const emptyScores: Record<string, number | null> = {};
      for (const j of judges) emptyScores[j.id] = null;
      const created: PerformanceItem = {
        id: newId,
        stt: nextStt,
        className: `Lớp ${nextStt}`,
        performanceName: '',
        isTeacherTheme: false,
        scores: emptyScores,
      };
      setSelectedId(newId);
      return [...prev, created];
    });
  };

  const handleRemovePerformance = (perfId: string) => {
    setPerformances((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev
        .filter((p) => p.id !== perfId)
        .map((p, idx) => ({ ...p, stt: idx + 1 }));
      if (selectedId === perfId && filtered[0]) {
        setSelectedId(filtered[0].id);
      }
      return filtered;
    });
  };

  const clampScoresToCriteria = (
    nextCriteriaMap: ScoringConfig['judgeCriteria'],
    currentCriteriaList: CriterionInfo[],
    currentJudges: JudgeInfo[]
  ) => {
    setPerformances((prev) =>
      prev.map((item) => {
        const nextScores = { ...item.scores };
        for (const j of currentJudges) {
          const maxScore = getJudgeMaxScore(j.id, nextCriteriaMap, currentCriteriaList);
          const currentVal = nextScores[j.id];
          if (currentVal !== null && currentVal !== undefined) {
            nextScores[j.id] = maxScore === 0 ? null : Math.min(currentVal, maxScore);
          }
        }
        return { ...item, scores: nextScores };
      })
    );
    setDraftScores({});
  };

  const handleToggleJudgeCriterion = (judgeId: JudgeId, criterionId: CriterionId) => {
    setConfig((prev) => {
      const currentList = prev.judgeCriteria[judgeId] ?? [];
      const exists = currentList.includes(criterionId);
      const nextList = exists
        ? currentList.filter((id) => id !== criterionId)
        : [...currentList, criterionId];
      const nextCriteriaMap = {
        ...prev.judgeCriteria,
        [judgeId]: nextList,
      };
      clampScoresToCriteria(nextCriteriaMap, criteria, judges);
      return {
        ...prev,
        judgeCriteria: nextCriteriaMap,
      };
    });
  };

  const handleResetDefaultAssignment = () => {
    setConfig((prev) => {
      const resetMap: Record<string, string[]> = {};
      for (const j of judges) {
        resetMap[j.id] = DEFAULT_JUDGE_CRITERIA[j.id] ?? [];
      }
      clampScoresToCriteria(resetMap, criteria, judges);
      return {
        ...prev,
        judgeCriteria: resetMap,
      };
    });
  };

  const handleUpdateJudge = (judgeId: JudgeId, partial: Partial<JudgeInfo>) => {
    setJudges((prev) =>
      prev.map((j) => (j.id === judgeId ? { ...j, ...partial } : j))
    );
  };

  const handleSetChairJudge = (judgeId: JudgeId) => {
    setJudges((prev) =>
      prev.map((j) => ({
        ...j,
        isChair: j.id === judgeId,
        role:
          j.id === judgeId
            ? 'Trưởng ban Giám khảo'
            : j.role === 'Trưởng ban Giám khảo'
              ? 'Ủy viên Ban Giám khảo'
              : j.role,
      }))
    );
  };

  const handleAddJudge = () => {
    const nextNum = judges.length + 1;
    const newId = `gk_${Date.now()}`;
    const newJudge: JudgeInfo = {
      id: newId,
      shortLabel: `GK${nextNum}`,
      fullName: `Giám khảo ${nextNum}`,
      role: 'Ủy viên Ban Giám khảo',
      isChair: false,
    };
    setJudges((prev) => [...prev, newJudge]);
    setConfig((prev) => ({
      ...prev,
      judgeCriteria: { ...prev.judgeCriteria, [newId]: [] },
    }));
  };

  const handleRemoveJudge = (judgeId: JudgeId) => {
    if (judges.length <= 1) return;
    setJudges((prev) => {
      const next = prev.filter((j) => j.id !== judgeId);
      if (!next.some((j) => j.isChair) && next[0]) {
        next[0] = { ...next[0], isChair: true, role: 'Trưởng ban Giám khảo' };
      }
      return next;
    });
  };

  const handleResetJudges = () => {
    setJudges(DEFAULT_JUDGES);
    setConfig((prev) => ({
      ...prev,
      judgeCriteria: DEFAULT_JUDGE_CRITERIA,
    }));
  };

  const handleUpdateCriterion = (id: CriterionId, partial: Partial<CriterionInfo>) => {
    setCriteria((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...partial } : c));
      clampScoresToCriteria(config.judgeCriteria, next, judges);
      return next;
    });
  };

  const handleAddCriterion = () => {
    const nextStt = criteria.length + 1;
    const newCrit: CriterionInfo = {
      id: `tc_${Date.now()}`,
      stt: nextStt,
      name: `Tiêu chí ${nextStt}`,
      shortName: `Tiêu chí ${nextStt}`,
      description: 'Mô tả nội dung chấm điểm của tiêu chí này.',
      maxPoints: 10,
    };
    setCriteria((prev) => [...prev, newCrit]);
  };

  const handleRemoveCriterion = (id: CriterionId) => {
    if (criteria.length <= 1) return;
    setCriteria((prev) => {
      const next = prev
        .filter((c) => c.id !== id)
        .map((c, idx) => ({ ...c, stt: idx + 1 }));
      const nextMap: Record<string, string[]> = {};
      for (const j of judges) {
        nextMap[j.id] = (config.judgeCriteria[j.id] ?? []).filter((cId) => cId !== id);
      }
      setConfig((prevCfg) => ({ ...prevCfg, judgeCriteria: nextMap }));
      clampScoresToCriteria(nextMap, next, judges);
      return next;
    });
  };

  const handleResetAllDefaults = () => {
    setEventMeta(DEFAULT_EVENT_META);
    setCriteria(DEFAULT_CRITERIA);
    setJudges(DEFAULT_JUDGES);
    setPrizeConfig(DEFAULT_PRIZE_CONFIG);
    setConfig(DEFAULT_CONFIG);
  };

  const handleUpdateEventMeta = (partial: Partial<EventMetadata>) => {
    setEventMeta((prev) => ({ ...prev, ...partial }));
  };

  const handleUpdatePrizeConfig = (partial: Partial<PrizeConfig>) => {
    setPrizeConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleChangeConfig = (partial: Partial<ScoringConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleLoadSampleScores = () => {
    setDraftScores({});
    setPerformances((prev) =>
      prev.map((item) => {
        const ratios = SAMPLE_RATIO_BY_STT[item.stt] ?? {};
        const nextScores = { ...item.scores };
        for (const j of judges) {
          const maxScore = getJudgeMaxScore(j.id, config.judgeCriteria, criteria);
          if (maxScore === 0) {
            nextScores[j.id] = null;
          } else {
            const ratio = ratios[j.id] ?? 0.88;
            const rawVal = maxScore * ratio;
            nextScores[j.id] = roundScore(Math.round(rawVal * 2) / 2);
          }
        }
        return { ...item, scores: nextScores };
      })
    );
  };

  const handleClearAllScores = () => {
    setDraftScores({});
    setPerformances((prev) =>
      prev.map((item) => {
        const empty: Record<string, number | null> = {};
        for (const j of judges) empty[j.id] = null;
        return { ...item, scores: empty };
      })
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportToCsv(evaluated, judges, criteria, config.judgeCriteria, eventMeta);
  };

  const handleExportBackup = () => {
    try {
      const fileName = exportBackupJson({
        eventMeta,
        judges,
        criteria,
        prizeConfig,
        config,
        performances,
      });
      setBackupNotice({
        type: 'success',
        message: `Đã lưu file dự phòng "${fileName}" gồm đầy đủ cấu hình, danh sách BGK, tiêu chí và điểm số.`,
      });
    } catch {
      setBackupNotice({
        type: 'error',
        message: 'Không thể tạo file dự phòng. Vui lòng thử lại.',
      });
    }
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const restored = parseBackupJson(text);
        setEventMeta({ ...DEFAULT_EVENT_META, ...restored.eventMeta });
        setJudges(restored.judges);
        setCriteria(restored.criteria);
        setPrizeConfig({ ...DEFAULT_PRIZE_CONFIG, ...restored.prizeConfig });
        setConfig({ ...DEFAULT_CONFIG, ...restored.config });
        setPerformances(restored.performances);
        setDraftScores({});
        if (restored.performances[0]) {
          setSelectedId(restored.performances[0].id);
        }
        setBackupNotice({
          type: 'success',
          message: `Đã nạp thành công dữ liệu từ "${file.name}" (${restored.performances.length} tiết mục, ${restored.judges.length} giám khảo).`,
        });
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'File dự phòng không hợp lệ hoặc bị hỏng.';
        setBackupNotice({
          type: 'error',
          message: msg,
        });
      }
    };
    reader.onerror = () => {
      setBackupNotice({
        type: 'error',
        message: 'Không thể đọc file đã chọn. Vui lòng thử lại.',
      });
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <TopBar
        brandTitle={eventMeta.schoolName}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPrint={handlePrint}
      />

      <EventMasthead
        eventMeta={eventMeta}
        onUpdateEventMeta={handleUpdateEventMeta}
        evaluated={evaluated}
        judges={judges}
        criteria={criteria}
        config={config}
        prizeConfig={prizeConfig}
      />

      <main className="no-print flex-1 mx-auto w-full max-w-[1400px] px-4 py-5 pb-24 sm:px-6 md:py-6 md:pb-8 lg:px-8">
        {backupNotice && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm ${
              backupNotice.type === 'success'
                ? 'border-[#16A34A]/30 bg-[#F0FDF4] text-[#166534]'
                : 'border-[#DC2626]/30 bg-[#FEF2F2] text-[#991B1B]'
            }`}
          >
            <span className="font-medium">{backupNotice.message}</span>
            <button
              type="button"
              onClick={() => setBackupNotice(null)}
              className="shrink-0 rounded px-2 py-1 text-xs font-semibold hover:bg-black/5 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <CriteriaAssignmentPanel
              judges={judges}
              criteria={criteria}
              judgeCriteria={config.judgeCriteria}
              onToggleJudgeCriterion={handleToggleJudgeCriterion}
              onUpdateJudge={handleUpdateJudge}
              onResetDefaultAssignment={handleResetDefaultAssignment}
              isOpen={criteriaPanelOpen}
              onToggleOpen={() => setCriteriaPanelOpen((v) => !v)}
            />

            <QuickEntryPanel
              performances={evaluated}
              judges={judges}
              criteria={criteria}
              eventMeta={eventMeta}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              draftScores={draftScores}
              onScoreInputChange={handleScoreInputChange}
              onScoreInputBlur={handleScoreInputBlur}
              onToggleTeacherTheme={handleToggleTeacherTheme}
              config={config}
              isOpen={quickEntryOpen}
              onToggleOpen={() => setQuickEntryOpen((v) => !v)}
            />

            <ScoringTable
              evaluated={evaluated}
              judges={judges}
              criteria={criteria}
              eventMeta={eventMeta}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              draftScores={draftScores}
              onScoreInputChange={handleScoreInputChange}
              onScoreInputBlur={handleScoreInputBlur}
              onUpdateClassName={handleUpdateClassName}
              onUpdatePerformanceName={handleUpdatePerformanceName}
              onToggleTeacherTheme={handleToggleTeacherTheme}
              onAddPerformance={handleAddPerformance}
              onRemovePerformance={handleRemovePerformance}
              config={config}
              onChangeConfig={handleChangeConfig}
              onLoadSampleScores={handleLoadSampleScores}
              onClearAllScores={handleClearAllScores}
              onExportCsv={handleExportCsv}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
            />
          </div>
        )}

        {activeTab === 'standings' && (
          <StandingsView
            evaluated={evaluated}
            judges={judges}
            eventMeta={eventMeta}
            prizeConfig={prizeConfig}
            onExportCsv={handleExportCsv}
            onPrint={handlePrint}
            onBackToLedger={() => setActiveTab('ledger')}
          />
        )}

        {activeTab === 'jury' && (
          <JuryView
            judges={judges}
            criteria={criteria}
            config={config}
            eventMeta={eventMeta}
            performanceCount={performances.length}
            prizeConfig={prizeConfig}
            onUpdateJudge={handleUpdateJudge}
            onSetChairJudge={handleSetChairJudge}
            onAddJudge={handleAddJudge}
            onRemoveJudge={handleRemoveJudge}
            onUpdateEventMeta={handleUpdateEventMeta}
            onResetJudges={handleResetJudges}
            onBackToLedger={() => setActiveTab('ledger')}
          />
        )}

        {activeTab === 'rules' && (
          <RulesView
            criteria={criteria}
            eventMeta={eventMeta}
            prizeConfig={prizeConfig}
            onUpdateCriterion={handleUpdateCriterion}
            onAddCriterion={handleAddCriterion}
            onRemoveCriterion={handleRemoveCriterion}
            onUpdateEventMeta={handleUpdateEventMeta}
            onUpdatePrizeConfig={handleUpdatePrizeConfig}
            onResetAllDefaults={handleResetAllDefaults}
            onBackToLedger={() => setActiveTab('ledger')}
          />
        )}
      </main>

      <footer className="no-print border-t border-[#E6DFD5] bg-white py-4 pb-20 md:pb-4 text-xs text-[#6B655E]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <span>
            {eventMeta.schoolName} · {eventMeta.eventTitle}
          </span>
          <span>Thư ký tổng hợp: {eventMeta.secretaryName || '—'}</span>
        </div>
      </footer>

      {/* A4 Landscape Official Print Layout (Anonymous to classes: Criterion headers only) */}
      <PrintSheet
        evaluated={evaluated}
        judges={judges}
        criteria={criteria}
        eventMeta={eventMeta}
        config={config}
      />
    </div>
  );
}
