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
  DEFAULT_JUDGE_CRITERIA,
  INITIAL_PERFORMANCES,
  SAMPLE_RATIO_BY_STT,
  SCHOOL_NAME,
  SECRETARY_NAME,
} from './data/initialData';
import {
  ActiveTab,
  CriterionId,
  JudgeId,
  PerformanceItem,
  ScoringConfig,
} from './types/scoring';
import {
  evaluatePerformances,
  exportToCsv,
  getJudgeMaxScore,
  parseScoreInput,
  roundScore,
} from './utils/scoring';

const STORAGE_KEY_PERFORMANCES = 'thcs-lhl-2011-performances-v2';
const STORAGE_KEY_CONFIG = 'thcs-lhl-2011-config-v2';

function loadInitialPerformances(): PerformanceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERFORMANCES);
    if (!raw) return INITIAL_PERFORMANCES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 12) {
      return parsed;
    }
  } catch {
    // Ignore corrupted storage
  }
  return INITIAL_PERFORMANCES;
}

function loadInitialConfig(): ScoringConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.judgeCriteria) {
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        judgeCriteria: {
          ...DEFAULT_JUDGE_CRITERIA,
          ...parsed.judgeCriteria,
        },
      };
    }
  } catch {
    // Ignore corrupted storage
  }
  return DEFAULT_CONFIG;
}

export default function App() {
  const [performances, setPerformances] = useState<PerformanceItem[]>(loadInitialPerformances);
  const [config, setConfig] = useState<ScoringConfig>(loadInitialConfig);
  const [activeTab, setActiveTab] = useState<ActiveTab>('ledger');
  const [selectedId, setSelectedId] = useState<string>('tm-01');
  const [criteriaPanelOpen, setCriteriaPanelOpen] = useState<boolean>(true);
  const [quickEntryOpen, setQuickEntryOpen] = useState<boolean>(true);
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PERFORMANCES, JSON.stringify(performances));
    } catch {
      // Ignore storage quota errors
    }
  }, [performances]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // Ignore storage quota errors
    }
  }, [config]);

  const evaluated = useMemo(
    () => evaluatePerformances(performances, config),
    [performances, config]
  );

  const handleScoreInputChange = (perfId: string, judgeId: JudgeId, raw: string) => {
    const cleaned = raw.replace(/[^0-9.,]/g, '');
    const draftKey = `${perfId}-${judgeId}`;
    const maxScore = getJudgeMaxScore(judgeId, config.judgeCriteria);

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
    const maxScore = getJudgeMaxScore(judgeId, config.judgeCriteria);

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

  const clampScoresToCriteria = (nextCriteria: ScoringConfig['judgeCriteria']) => {
    const judgeIds: JudgeId[] = ['gk1', 'gk2', 'gk3', 'gk4', 'gk5'];
    setPerformances((prev) =>
      prev.map((item) => {
        const nextScores = { ...item.scores };
        for (const jId of judgeIds) {
          const maxScore = getJudgeMaxScore(jId, nextCriteria);
          const currentVal = nextScores[jId];
          if (currentVal !== null) {
            nextScores[jId] = maxScore === 0 ? null : Math.min(currentVal, maxScore);
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
      const nextCriteria = {
        ...prev.judgeCriteria,
        [judgeId]: nextList,
      };
      clampScoresToCriteria(nextCriteria);
      return {
        ...prev,
        judgeCriteria: nextCriteria,
      };
    });
  };

  const handleResetDefaultAssignment = () => {
    setConfig((prev) => {
      clampScoresToCriteria(DEFAULT_JUDGE_CRITERIA);
      return {
        ...prev,
        judgeCriteria: DEFAULT_JUDGE_CRITERIA,
      };
    });
  };

  const handleChangeConfig = (partial: Partial<ScoringConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleLoadSampleScores = () => {
    const judgeIds: JudgeId[] = ['gk1', 'gk2', 'gk3', 'gk4', 'gk5'];
    setDraftScores({});
    setPerformances((prev) =>
      prev.map((item) => {
        const ratios = SAMPLE_RATIO_BY_STT[item.stt];
        if (!ratios) return item;
        const nextScores = { ...item.scores };
        for (const jId of judgeIds) {
          const maxScore = getJudgeMaxScore(jId, config.judgeCriteria);
          if (maxScore === 0) {
            nextScores[jId] = null;
          } else {
            // Round to nearest 0.5 for clean realistic judge marks
            const rawVal = maxScore * ratios[jId];
            nextScores[jId] = roundScore(Math.round(rawVal * 2) / 2);
          }
        }
        return {
          ...item,
          scores: nextScores,
        };
      })
    );
  };

  const handleClearAllScores = () => {
    setDraftScores({});
    setPerformances((prev) =>
      prev.map((item) => ({
        ...item,
        scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
      }))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportToCsv(evaluated, config.judgeCriteria);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <TopBar activeTab={activeTab} onSelectTab={setActiveTab} onPrint={handlePrint} />

      <EventMasthead evaluated={evaluated} config={config} />

      <main className="no-print flex-1 mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <CriteriaAssignmentPanel
              judgeCriteria={config.judgeCriteria}
              onToggleJudgeCriterion={handleToggleJudgeCriterion}
              onResetDefaultAssignment={handleResetDefaultAssignment}
              isOpen={criteriaPanelOpen}
              onToggleOpen={() => setCriteriaPanelOpen((v) => !v)}
            />

            <QuickEntryPanel
              performances={evaluated}
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
              selectedId={selectedId}
              onSelectId={setSelectedId}
              draftScores={draftScores}
              onScoreInputChange={handleScoreInputChange}
              onScoreInputBlur={handleScoreInputBlur}
              onUpdateClassName={handleUpdateClassName}
              onUpdatePerformanceName={handleUpdatePerformanceName}
              onToggleTeacherTheme={handleToggleTeacherTheme}
              config={config}
              onChangeConfig={handleChangeConfig}
              onLoadSampleScores={handleLoadSampleScores}
              onClearAllScores={handleClearAllScores}
              onExportCsv={handleExportCsv}
            />
          </div>
        )}

        {activeTab === 'standings' && (
          <StandingsView
            evaluated={evaluated}
            onExportCsv={handleExportCsv}
            onPrint={handlePrint}
            onBackToLedger={() => setActiveTab('ledger')}
          />
        )}

        {activeTab === 'jury' && (
          <JuryView config={config} onBackToLedger={() => setActiveTab('ledger')} />
        )}

        {activeTab === 'rules' && (
          <RulesView onBackToLedger={() => setActiveTab('ledger')} />
        )}
      </main>

      <footer className="no-print border-t border-[#E5E0D8] bg-white py-4 text-xs text-[#6B655E]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <span>
            {SCHOOL_NAME} · Hội thi Văn nghệ Kỷ niệm 44 năm Ngày Nhà giáo Việt Nam 20/11
          </span>
          <span>Thư ký tổng hợp: {SECRETARY_NAME}</span>
        </div>
      </footer>

      {/* A4 Landscape Official Print Layout */}
      <PrintSheet evaluated={evaluated} config={config} />
    </div>
  );
}
