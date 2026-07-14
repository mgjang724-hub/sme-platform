/* @ds-bundle: {"format":3,"namespace":"CourseDevHubDesignSystem_28b1c1","components":[],"sourceHashes":{"ui_kits/coursedev-hub/App.jsx":"714fcdc5ea54","ui_kits/coursedev-hub/DetailPanel.jsx":"8c4f76246f16","ui_kits/coursedev-hub/ProjectCard.jsx":"e4c0df700651","ui_kits/coursedev-hub/Sidebar.jsx":"5a5f09c083af","ui_kits/coursedev-hub/SummaryCards.jsx":"25bd06186f1d","ui_kits/coursedev-hub/TaskPanel.jsx":"dcb7fc298743","ui_kits/coursedev-hub/TopBar.jsx":"a48e828ec95f","ui_kits/coursedev-hub/data.jsx":"e562bef67de1","ui_kits/coursedev-hub/primitives.jsx":"2df3431918f8"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CourseDevHubDesignSystem_28b1c1 = window.CourseDevHubDesignSystem_28b1c1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/coursedev-hub/App.jsx
try { (() => {
// CourseDev Hub — app shell, view routing, detail panel state
function SectionHead({
  children,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "26px 0 14px"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      color: "var(--fg-1)"
    }
  }, children), action);
}
function FilterTabs({
  tabs,
  active,
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => onPick(t.id),
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      padding: "7px 14px",
      borderRadius: 999,
      transition: "all .12s",
      border: `1px solid ${active === t.id ? "transparent" : "var(--border)"}`,
      background: active === t.id ? "var(--primary-tint)" : "#fff",
      color: active === t.id ? "var(--primary-active)" : "var(--fg-3)"
    }
  }, t.ko, t.n != null && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      fontFamily: "var(--font-num)",
      color: active === t.id ? "var(--primary)" : "var(--fg-4)"
    }
  }, t.n))));
}
function DashboardView({
  data,
  onOpen,
  setView
}) {
  const atRisk = data.projects.filter(p => p.risk && (p.risk.level === "delay" || p.risk.level === "duesoon"));
  const rest = data.projects.filter(p => !atRisk.includes(p));
  return /*#__PURE__*/React.createElement("div", {
    className: "dash-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(SummaryCards, {
    onPick: setView
  }), /*#__PURE__*/React.createElement(SectionHead, {
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "ter",
      iconRight: "arrow-right",
      onClick: () => setView("projects")
    }, "\uC804\uCCB4 \uBCF4\uAE30")
  }, "\uC8FC\uC758\uAC00 \uD544\uC694\uD55C \uACFC\uC815"), /*#__PURE__*/React.createElement(ProjectGrid, {
    projects: atRisk,
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement(SectionHead, null, "\uADF8 \uC678 \uC9C4\uD589 \uC911\uC778 \uACFC\uC815"), /*#__PURE__*/React.createElement(ProjectGrid, {
    projects: rest,
    onOpen: onOpen
  })), /*#__PURE__*/React.createElement("div", {
    className: "dash-rail"
  }, /*#__PURE__*/React.createElement(TaskPanel, {
    data: data,
    onOpenProject: onOpen
  })));
}
function ProjectsView({
  data,
  onOpen
}) {
  const [tab, setTab] = useState("all");
  const tabs = [{
    id: "all",
    ko: "전체",
    n: data.projects.length
  }, {
    id: "risk",
    ko: "지연/위험",
    n: data.projects.filter(p => p.risk && (p.risk.level === "delay" || p.risk.level === "duesoon")).length
  }, {
    id: "soon",
    ko: "마감 임박",
    n: data.projects.filter(p => p.dleft <= 8).length
  }, {
    id: "mine",
    ko: "내 담당",
    n: data.projects.filter(p => p.owner.name === "김정수").length
  }];
  let list = data.projects;
  if (tab === "risk") list = list.filter(p => p.risk && (p.risk.level === "delay" || p.risk.level === "duesoon"));
  if (tab === "soon") list = list.filter(p => p.dleft <= 8);
  if (tab === "mine") list = list.filter(p => p.owner.name === "김정수");
  return /*#__PURE__*/React.createElement("div", {
    className: "projects-view",
    style: {
      padding: "22px 28px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(FilterTabs, {
    tabs: tabs,
    active: tab,
    onPick: setTab
  })), /*#__PURE__*/React.createElement(ProjectGrid, {
    projects: list,
    onOpen: onOpen
  }));
}
function EmptyView({
  icon,
  title,
  body
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "90px 28px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 20,
      background: "var(--primary-tint)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 28,
    color: "var(--primary)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: "var(--fg-1)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--fg-3)",
      marginTop: 7,
      maxWidth: 340,
      lineHeight: 1.6
    }
  }, body));
}
const VIEW_META = {
  dashboard: {
    title: "대시보드",
    sub: "2026년 6월 2일 화요일 · 안녕하세요 김정수님 👋"
  },
  projects: {
    title: "프로젝트",
    sub: "진행 중인 모든 과정 개발 현황"
  },
  schedule: {
    title: "일정",
    sub: "과정별 마감과 단계 일정"
  },
  files: {
    title: "파일",
    sub: "차시별 산출물과 누락 파일"
  },
  feedback: {
    title: "피드백",
    sub: "검토 의견과 응답 현황"
  },
  approvals: {
    title: "승인",
    sub: "처리 대기 중인 승인 요청"
  },
  settings: {
    title: "설정",
    sub: "워크스페이스 환경설정"
  }
};
function App() {
  const data = window.CDH_DATA;
  const [view, setView] = useState("dashboard");
  const [detail, setDetail] = useState(null);
  const meta = VIEW_META[view];
  const onNew = () => alert("새 과정 만들기 — 데모에서는 비활성화되어 있어요.");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      background: "var(--bg-page)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    view: view,
    setView: setView
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: meta.title,
    subtitle: meta.sub,
    onNew: onNew
  }), view === "dashboard" && /*#__PURE__*/React.createElement(DashboardView, {
    data: data,
    onOpen: setDetail,
    setView: setView
  }), view === "projects" && /*#__PURE__*/React.createElement(ProjectsView, {
    data: data,
    onOpen: setDetail
  }), view === "approvals" && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "22px 28px 40px"
    }
  }, /*#__PURE__*/React.createElement(ProjectGrid, {
    projects: data.projects.filter(p => p.approvals > 0),
    onOpen: setDetail
  })), view === "files" && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "22px 28px 40px"
    }
  }, /*#__PURE__*/React.createElement(ProjectGrid, {
    projects: data.projects.filter(p => p.missing > 0),
    onOpen: setDetail
  })), view === "schedule" && /*#__PURE__*/React.createElement(EmptyView, {
    icon: "calendar-days",
    title: "\uC77C\uC815 \uBCF4\uAE30\uB294 \uC900\uBE44 \uC911\uC774\uC5D0\uC694",
    body: "\uACFC\uC815\uBCC4 \uB2E8\uACC4 \uC77C\uC815\uACFC \uB9C8\uAC10\uC744 \uD0C0\uC784\uB77C\uC778\uC73C\uB85C \uBCF4\uC5EC\uC904 \uD654\uBA74\uC774\uC5D0\uC694. \uB370\uBAA8\uC5D0\uC11C\uB294 \uB300\uC2DC\uBCF4\uB4DC\uC758 \u2018\uB9C8\uAC10 \uC784\uBC15\u2019 \uD328\uB110\uC744 \uCC38\uACE0\uD574 \uC8FC\uC138\uC694."
  }), view === "feedback" && /*#__PURE__*/React.createElement(EmptyView, {
    icon: "message-square",
    title: "\uD53C\uB4DC\uBC31 \uD654\uBA74\uC740 \uC900\uBE44 \uC911\uC774\uC5D0\uC694",
    body: "\uAC80\uD1A0 \uC758\uACAC\uACFC \uC751\uB2F5\uC744 \uBAA8\uC544 \uBCF4\uC5EC\uC904 \uD654\uBA74\uC774\uC5D0\uC694. \uB370\uBAA8\uC5D0\uC11C\uB294 \uACFC\uC815 \uCE74\uB4DC\uC758 \u2018\uB2E4\uC74C \uC791\uC5C5\u2019\uC73C\uB85C \uD750\uB984\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC5B4\uC694."
  }), view === "settings" && /*#__PURE__*/React.createElement(EmptyView, {
    icon: "settings",
    title: "\uC124\uC815 \uD654\uBA74\uC740 \uC900\uBE44 \uC911\uC774\uC5D0\uC694",
    body: "\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4, \uC54C\uB9BC, \uD300 \uAD8C\uD55C\uC744 \uAD00\uB9AC\uD560 \uD654\uBA74\uC774\uC5D0\uC694."
  })), /*#__PURE__*/React.createElement(DetailPanel, {
    project: detail,
    onClose: () => setDetail(null)
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coursedev-hub/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coursedev-hub/DetailPanel.jsx
try { (() => {
// CourseDev Hub — project detail side panel (slides in from right)
const PIPELINE = ["plan", "script", "story", "film", "edit", "lms", "qa", "done"];
function Stepper({
  current
}) {
  const idx = PIPELINE.indexOf(current);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 0
    }
  }, PIPELINE.map((st, i) => {
    const s = window.CDH_DATA.stages[st];
    const state = i < idx ? "done" : i === idx ? "cur" : "todo";
    const dot = state === "done" ? "var(--primary)" : state === "cur" ? "var(--primary)" : "var(--border-strong)";
    return /*#__PURE__*/React.createElement("div", {
      key: st,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 34
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: state === "cur" ? 14 : 11,
        height: state === "cur" ? 14 : 11,
        borderRadius: "50%",
        background: state === "todo" ? "#fff" : dot,
        border: `2px solid ${dot}`,
        boxShadow: state === "cur" ? "0 0 0 4px var(--primary-tint)" : "none",
        zIndex: 1
      }
    }), i < PIPELINE.length - 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 13,
        width: 2,
        height: 26,
        background: i < idx ? "var(--primary)" : "var(--border)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: state === "cur" ? 700 : 500,
        color: state === "todo" ? "var(--fg-4)" : state === "cur" ? "var(--primary-active)" : "var(--fg-2)"
      }
    }, s.ko, state === "cur" && " · 진행 중"));
  }));
}
function MetaRow({
  icon,
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 0",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    color: "var(--fg-4)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--fg-3)",
      width: 78,
      flex: "none"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--fg-1)",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, children));
}
function DetailPanel({
  project,
  onClose
}) {
  const open = !!project;
  const p = project || {};
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(17,24,39,0.32)",
      opacity: open ? 1 : 0,
      pointerEvents: open ? "auto" : "none",
      transition: "opacity .2s",
      zIndex: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: 0,
      right: 0,
      height: "100%",
      width: 420,
      background: "#fff",
      boxShadow: "var(--shadow-lg)",
      zIndex: 41,
      transform: open ? "translateX(0)" : "translateX(100%)",
      transition: "transform .24s cubic-bezier(.2,.8,.2,1)",
      display: "flex",
      flexDirection: "column"
    }
  }, project && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 22px 16px",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(StageChip, {
    stage: p.stage
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)"
    }
  }, p.sub)), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: "var(--fg-1)"
    }
  }, p.title)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: 0,
      background: "var(--bg-sunken)",
      cursor: "pointer",
      width: 32,
      height: 32,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 17,
    color: "var(--fg-3)"
  }))), p.risk && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(RiskTag, {
    level: p.risk.level,
    text: p.risk.text,
    full: true
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "18px 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--fg-2)"
    }
  }, "\uC9C4\uD589\uB960"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 14,
      fontWeight: 700
    }
  }, p.progress, "%")), /*#__PURE__*/React.createElement(Progress, {
    value: p.progress,
    danger: p.risk && (p.risk.level === "delay" || p.risk.level === "duesoon")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      marginBottom: 8,
      fontSize: 13,
      fontWeight: 700,
      color: "var(--fg-2)"
    }
  }, "\uAC1C\uBC1C \uB2E8\uACC4"), /*#__PURE__*/React.createElement(Stepper, {
    current: p.stage
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      marginBottom: 4,
      fontSize: 13,
      fontWeight: 700,
      color: "var(--fg-2)"
    }
  }, "\uACFC\uC815 \uC815\uBCF4"), /*#__PURE__*/React.createElement(MetaRow, {
    icon: "calendar",
    label: "\uB9C8\uAC10\uC77C"
  }, p.due, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: p.dleft <= 4 ? "var(--error-fg)" : "var(--fg-4)",
      fontFamily: "var(--font-num)",
      fontWeight: 700
    }
  }, "D-", p.dleft)), /*#__PURE__*/React.createElement(MetaRow, {
    icon: "user",
    label: "\uB2F4\uB2F9 PM"
  }, /*#__PURE__*/React.createElement(Avatar, {
    initial: p.owner.initial,
    c: p.owner.c,
    size: 22
  }), p.owner.name), /*#__PURE__*/React.createElement(MetaRow, {
    icon: "building-2",
    label: "\uAC1C\uBC1C\uC0AC"
  }, p.vendor), /*#__PURE__*/React.createElement(MetaRow, {
    icon: "history",
    label: "\uCD5C\uADFC \uC5C5\uB370\uC774\uD2B8"
  }, p.update, " \xB7 ", p.updatedAt), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(StatPill, {
    icon: "file-x",
    n: p.missing,
    label: "\uD30C\uC77C \uB204\uB77D",
    tone: p.missing ? "info" : "muted"
  }), /*#__PURE__*/React.createElement(StatPill, {
    icon: "stamp",
    n: p.approvals,
    label: "\uC2B9\uC778 \uB300\uAE30",
    tone: p.approvals ? "warning" : "muted"
  }), /*#__PURE__*/React.createElement(StatPill, {
    icon: "message-square",
    n: p.feedback,
    label: "\uD53C\uB4DC\uBC31",
    tone: p.feedback ? "info" : "muted"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 22px",
      borderTop: "1px solid var(--border)",
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "sec",
    icon: "message-square",
    style: {
      flex: "none"
    }
  }, "\uD53C\uB4DC\uBC31"), /*#__PURE__*/React.createElement(Button, {
    variant: "pri",
    iconRight: "arrow-right",
    style: {
      flex: 1,
      justifyContent: "center"
    }
  }, p.next)))));
}
function StatPill({
  icon,
  n,
  label,
  tone
}) {
  const tones = {
    info: {
      bg: "var(--info-bg)",
      fg: "var(--info-fg)"
    },
    warning: {
      bg: "var(--warning-bg)",
      fg: "var(--warning-fg)"
    },
    muted: {
      bg: "var(--bg-sunken)",
      fg: "var(--fg-4)"
    }
  };
  const t = tones[tone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: t.bg,
      borderRadius: "var(--r-lg)",
      padding: "11px 12px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    color: t.fg
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 18,
      fontWeight: 700,
      color: t.fg,
      marginTop: 3
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: t.fg,
      opacity: 0.85,
      marginTop: 1
    }
  }, label));
}
Object.assign(window, {
  DetailPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coursedev-hub/DetailPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coursedev-hub/ProjectCard.jsx
try { (() => {
// CourseDev Hub — project (course) card + grid
function ProjectCard({
  p,
  onOpen
}) {
  const [hover, setHover] = useState(false);
  const danger = p.risk && (p.risk.level === "delay" || p.risk.level === "duesoon");
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => onOpen(p),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: "#fff",
      border: `1px solid ${hover ? "#F1C9BB" : "var(--border)"}`,
      borderRadius: "var(--r-xl)",
      boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-md)",
      padding: "18px 20px",
      cursor: "pointer",
      transition: "all .15s",
      transform: hover ? "translateY(-2px)" : "none",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: "var(--fg-1)"
    }
  }, p.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--fg-4)",
      marginTop: 3
    }
  }, p.sub)), /*#__PURE__*/React.createElement(StageChip, {
    stage: p.stage
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 12.5,
      color: "var(--fg-3)",
      margin: "13px 0 11px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 14,
    color: "var(--fg-4)"
  }), /*#__PURE__*/React.createElement("span", null, "\uB9C8\uAC10 ", p.due), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      color: p.dleft <= 4 ? "var(--error-fg)" : "var(--fg-3)"
    }
  }, "\xB7 D-", p.dleft), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--border-strong)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, p.vendor)), /*#__PURE__*/React.createElement(Progress, {
    value: p.progress,
    danger: danger
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: "var(--fg-3)",
      margin: "6px 0 13px"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uC9C4\uD589\uB960"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      color: "var(--fg-1)"
    }
  }, p.progress, "%")), p.risk && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 13
    }
  }, /*#__PURE__*/React.createElement(RiskTag, {
    level: p.risk.level,
    text: p.risk.text,
    full: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "auto",
      paddingTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initial: p.owner.initial,
    c: p.owner.c,
    size: 26
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--fg-2)",
      fontWeight: 600,
      lineHeight: 1.2
    }
  }, p.owner.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--fg-4)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, p.update, " \xB7 ", p.updatedAt))), /*#__PURE__*/React.createElement(Button, {
    variant: "sec",
    size: "sm",
    iconRight: "arrow-right",
    onClick: e => {
      e.stopPropagation();
      onOpen(p);
    }
  }, p.next)));
}
function ProjectGrid({
  projects,
  onOpen
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: 16
    }
  }, projects.map(p => /*#__PURE__*/React.createElement(ProjectCard, {
    key: p.id,
    p: p,
    onOpen: onOpen
  })));
}
Object.assign(window, {
  ProjectCard,
  ProjectGrid
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coursedev-hub/ProjectCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coursedev-hub/Sidebar.jsx
try { (() => {
// CourseDev Hub — left sidebar nav
const NAV = [{
  id: "dashboard",
  ko: "대시보드",
  icon: "layout-dashboard"
}, {
  id: "projects",
  ko: "프로젝트",
  icon: "folder-kanban"
}, {
  id: "schedule",
  ko: "일정",
  icon: "calendar-days"
}, {
  id: "files",
  ko: "파일",
  icon: "folder",
  badge: 3
}, {
  id: "feedback",
  ko: "피드백",
  icon: "message-square"
}, {
  id: "approvals",
  ko: "승인",
  icon: "stamp",
  badge: 5
}];
function NavItem({
  item,
  active,
  onClick
}) {
  const [hover, setHover] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "9px 12px",
      borderRadius: "var(--r-md)",
      fontSize: 14,
      fontWeight: active ? 600 : 500,
      cursor: "pointer",
      color: active ? "var(--primary-active)" : "var(--fg-2)",
      background: active ? "var(--primary-tint)" : hover ? "var(--bg-sunken)" : "transparent",
      transition: "background .12s"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: item.icon,
    size: 18,
    color: active ? "var(--primary)" : "var(--fg-3)"
  }), /*#__PURE__*/React.createElement("span", null, item.ko), item.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontFamily: "var(--font-num)",
      fontSize: 11,
      fontWeight: 700,
      background: active ? "var(--primary)" : "var(--primary)",
      color: "#fff",
      borderRadius: 999,
      padding: "1px 7px"
    }
  }, item.badge));
}
function Sidebar({
  view,
  setView
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 232,
      flex: "none",
      background: "#fff",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 14px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-iscream-full.png",
    alt: "i-Scream \uC6D0\uACA9\uAD50\uC721\uC5F0\uC218\uC6D0",
    style: {
      height: 26,
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--fg-4)",
      fontWeight: 600,
      marginTop: 9,
      letterSpacing: "0.02em"
    }
  }, "CourseDev Hub")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      padding: "6px 14px"
    }
  }, NAV.map(n => /*#__PURE__*/React.createElement(NavItem, {
    key: n.id,
    item: n,
    active: view === n.id,
    onClick: () => setView(n.id)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      padding: 14,
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(NavItem, {
    item: {
      id: "settings",
      ko: "설정",
      icon: "settings"
    },
    active: view === "settings",
    onClick: () => setView("settings")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initial: "\uAE40",
    c: "orange",
    size: 32
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600
    }
  }, "\uAE40\uC815\uC218"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)"
    }
  }, "\uAD50\uC721 PM")))));
}
Object.assign(window, {
  Sidebar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coursedev-hub/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coursedev-hub/SummaryCards.jsx
try { (() => {
// CourseDev Hub — top summary KPI cards
function KpiCard({
  label,
  value,
  sub,
  icon,
  tone,
  onClick
}) {
  const tones = {
    primary: {
      bg: "var(--primary-tint)",
      fg: "var(--primary)",
      subc: "var(--fg-3)"
    },
    error: {
      bg: "var(--error-bg)",
      fg: "var(--error)",
      subc: "var(--error-fg)"
    },
    warning: {
      bg: "var(--warning-bg)",
      fg: "var(--warning)",
      subc: "var(--warning-fg)"
    },
    info: {
      bg: "var(--info-bg)",
      fg: "var(--info)",
      subc: "var(--info-fg)"
    },
    success: {
      bg: "var(--success-bg)",
      fg: "var(--success)",
      subc: "var(--success-fg)"
    }
  };
  const t = tones[tone] || tones.primary;
  const [hover, setHover] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      flex: 1,
      minWidth: 150,
      background: "#fff",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-xl)",
      boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-md)",
      padding: "16px 18px",
      cursor: "pointer",
      transition: "box-shadow .15s, transform .15s",
      transform: hover ? "translateY(-2px)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--fg-3)",
      fontWeight: 500
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34,
      borderRadius: "var(--r-md)",
      background: t.bg,
      color: t.fg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    color: t.fg
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 30,
      fontWeight: 700,
      lineHeight: 1,
      color: "var(--fg-1)"
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 7,
      fontWeight: 600,
      color: t.subc
    }
  }, sub));
}
function SummaryCards({
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kpi-row"
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "\uC9C4\uD589 \uC911",
    value: "12",
    sub: "\uC804\uCCB4 \uACFC\uC815",
    icon: "play-circle",
    tone: "primary",
    onClick: () => onPick("projects")
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "\uC9C0\uC5F0",
    value: "2",
    sub: "\uC870\uCE58 \uD544\uC694",
    icon: "alert-triangle",
    tone: "error",
    onClick: () => onPick("projects")
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "\uC2B9\uC778 \uB300\uAE30",
    value: "5",
    sub: "\uC624\uB298 \uCC98\uB9AC",
    icon: "stamp",
    tone: "warning",
    onClick: () => onPick("approvals")
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "\uD30C\uC77C \uB204\uB77D",
    value: "3",
    sub: "\uC694\uCCAD \uBCF4\uB0B4\uAE30",
    icon: "file-x",
    tone: "info",
    onClick: () => onPick("files")
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "\uB9C8\uAC10 \uC784\uBC15",
    value: "4",
    sub: "7\uC77C \uC774\uB0B4",
    icon: "calendar-clock",
    tone: "success",
    onClick: () => onPick("schedule")
  }));
}
Object.assign(window, {
  SummaryCards,
  KpiCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coursedev-hub/SummaryCards.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coursedev-hub/TaskPanel.jsx
try { (() => {
// CourseDev Hub — right rail: today's tasks, deadlines, recent activity
const TASK_META = {
  approval: {
    icon: "stamp",
    fg: "var(--warning-fg)",
    bg: "var(--warning-bg)"
  },
  feedback: {
    icon: "message-square",
    fg: "var(--info-fg)",
    bg: "var(--info-bg)"
  },
  missing: {
    icon: "file-x",
    fg: "var(--info-fg)",
    bg: "var(--info-bg)"
  },
  delay: {
    icon: "alert-triangle",
    fg: "var(--error-fg)",
    bg: "var(--error-bg)"
  }
};
function PanelCard({
  title,
  count,
  children,
  action
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "#fff",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-xl)",
      boxShadow: "var(--shadow-md)",
      padding: "16px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 700,
      color: "var(--fg-1)"
    }
  }, title), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 12,
      fontWeight: 700,
      color: "var(--primary)",
      background: "var(--primary-tint)",
      borderRadius: 999,
      padding: "1px 8px"
    }
  }, count)), action), children);
}
function TaskRow({
  t,
  onAct,
  done
}) {
  const m = TASK_META[t.kind] || TASK_META.approval;
  const [hover, setHover] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "9px 8px",
      borderRadius: "var(--r-md)",
      background: hover ? "var(--bg-sunken)" : "transparent",
      opacity: done ? 0.45 : 1,
      transition: "all .12s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      flex: "none",
      borderRadius: 8,
      background: m.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: done ? "check" : m.icon,
    size: 15,
    color: m.fg
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--fg-1)",
      fontWeight: 500,
      lineHeight: 1.35,
      textDecoration: done ? "line-through" : "none"
    }
  }, t.text)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      flex: "none",
      color: t.due === "오늘" ? "var(--error-fg)" : "var(--fg-4)"
    }
  }, t.due), !done && hover && /*#__PURE__*/React.createElement("button", {
    onClick: () => onAct(t.id),
    style: {
      flex: "none",
      border: 0,
      background: "var(--primary)",
      color: "#fff",
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      borderRadius: 8,
      padding: "5px 10px"
    }
  }, "\uCC98\uB9AC"));
}
function TaskPanel({
  data,
  onOpenProject
}) {
  const [doneTasks, setDoneTasks] = useState({});
  const act = id => setDoneTasks(d => ({
    ...d,
    [id]: true
  }));
  const remaining = data.tasks.filter(t => !doneTasks[t.id]).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PanelCard, {
    title: "\uC624\uB298 \uCC98\uB9AC\uD560 \uC77C",
    count: remaining
  }, remaining === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "18px 0",
      color: "var(--fg-3)",
      fontSize: 13.5
    }
  }, "\uCC98\uB9AC\uD560 \uC77C\uC774 \uC5C6\uC5B4\uC694. \uAE54\uB054\uD558\uB124\uC694! \uD83C\uDF89") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, data.tasks.map(t => /*#__PURE__*/React.createElement(TaskRow, {
    key: t.id,
    t: t,
    done: doneTasks[t.id],
    onAct: act
  })))), /*#__PURE__*/React.createElement(PanelCard, {
    title: "\uB9C8\uAC10 \uC784\uBC15",
    count: data.deadlines.length
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 9
    }
  }, data.deadlines.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      flex: "none",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 14,
      fontWeight: 700,
      color: d.dleft <= 4 ? "var(--error-fg)" : "var(--fg-1)"
    }
  }, d.date), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 11,
      fontWeight: 600,
      color: d.dleft <= 4 ? "var(--error)" : "var(--fg-4)"
    }
  }, "D-", d.dleft)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--fg-1)",
      fontWeight: 500,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, d.title)), /*#__PURE__*/React.createElement(StageChip, {
    stage: d.stage
  }))))), /*#__PURE__*/React.createElement(PanelCard, {
    title: "\uCD5C\uADFC \uC5C5\uB370\uC774\uD2B8"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 13
    }
  }, data.activity.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initial: a.initial,
    c: a.c,
    size: 28
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--fg-2)",
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--fg-1)",
      fontWeight: 600
    }
  }, a.who), "\uB2D8\uC774 ", a.text), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--fg-4)",
      marginTop: 2
    }
  }, a.at)))))));
}
Object.assign(window, {
  TaskPanel,
  PanelCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coursedev-hub/TaskPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coursedev-hub/TopBar.jsx
try { (() => {
// CourseDev Hub — sticky top bar (page header + search + actions)
function TopBar({
  title,
  subtitle,
  onNew
}) {
  const [focus, setFocus] = useState(false);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 5,
      background: "rgba(247,248,250,0.86)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderBottom: "1px solid var(--border)",
      padding: "16px 28px",
      display: "flex",
      alignItems: "center",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      fontFamily: "var(--font-display)",
      color: "var(--fg-1)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--fg-3)",
      marginTop: 3
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#fff",
      border: `1px solid ${focus ? "var(--primary)" : "var(--border-strong)"}`,
      boxShadow: focus ? "var(--shadow-focus)" : "none",
      borderRadius: "var(--r-md)",
      padding: "9px 12px",
      width: 240,
      transition: "all .14s"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16,
    color: "var(--fg-4)"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "\uACFC\uC815 \xB7 \uB2F4\uB2F9\uC790 \uAC80\uC0C9",
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      border: 0,
      outline: 0,
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      width: "100%",
      background: "transparent",
      color: "var(--fg-1)"
    }
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 40,
      height: 40,
      borderRadius: "var(--r-md)",
      background: "#fff",
      border: "1px solid var(--border-strong)",
      color: "var(--fg-3)",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 18,
    color: "var(--fg-3)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 8,
      right: 9,
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "var(--primary)",
      border: "1.5px solid #fff"
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "pri",
    icon: "plus",
    onClick: onNew
  }, "\uC0C8 \uACFC\uC815 \uB9CC\uB4E4\uAE30"));
}
Object.assign(window, {
  TopBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coursedev-hub/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coursedev-hub/data.jsx
try { (() => {
// CourseDev Hub — mock data for the UI kit
// All Korean copy follows the brand voice: warm 해요체, plain noun-phrase labels.

window.CDH_DATA = {
  user: {
    name: "김정수",
    role: "교육 PM",
    initial: "김"
  },
  // course pipeline stages -> chip token keys (see colors_and_type.css)
  stages: {
    plan: {
      ko: "기획",
      token: "plan"
    },
    script: {
      ko: "대본 검토",
      token: "script"
    },
    story: {
      ko: "스토리보드",
      token: "story"
    },
    film: {
      ko: "촬영",
      token: "film"
    },
    edit: {
      ko: "편집",
      token: "edit"
    },
    lms: {
      ko: "LMS 포팅",
      token: "lms"
    },
    qa: {
      ko: "QA 검수",
      token: "qa"
    },
    done: {
      ko: "완료",
      token: "done"
    }
  },
  projects: [{
    id: "p1",
    title: "신규 교사 직무연수",
    sub: "15차시 · 동영상",
    stage: "film",
    progress: 62,
    due: "2026.06.18",
    dleft: 16,
    vendor: "미디어랩",
    owner: {
      name: "김정수",
      initial: "김",
      c: "orange"
    },
    update: "강사 촬영 2회차 완료",
    updatedAt: "3시간 전",
    risk: {
      level: "delay",
      text: "촬영 일정 2일 지연 — 강사 일정 재확인 필요"
    },
    next: "강사 일정 재확인",
    missing: 0,
    approvals: 0,
    feedback: 1
  }, {
    id: "p2",
    title: "초등 디지털 리터러시",
    sub: "10차시 · 인터랙티브",
    stage: "script",
    progress: 28,
    due: "2026.07.02",
    dleft: 30,
    vendor: "에듀비전",
    owner: {
      name: "이서연",
      initial: "이",
      c: "violet"
    },
    update: "2차시 대본 검토 요청 도착",
    updatedAt: "어제",
    risk: {
      level: "feedback",
      text: "대본 검토 의견 2건 응답 대기"
    },
    next: "대본 검토하기",
    missing: 0,
    approvals: 1,
    feedback: 2
  }, {
    id: "p3",
    title: "교직원 정보보안 교육",
    sub: "6차시 · 동영상",
    stage: "edit",
    progress: 74,
    due: "2026.06.10",
    dleft: 8,
    vendor: "미디어랩",
    owner: {
      name: "박지훈",
      initial: "박",
      c: "teal"
    },
    update: "3차시 편집본 1차 업로드",
    updatedAt: "5시간 전",
    risk: {
      level: "missing",
      text: "5–6차시 자막 파일 누락"
    },
    next: "자막 파일 요청",
    missing: 2,
    approvals: 0,
    feedback: 0
  }, {
    id: "p4",
    title: "학부모 상담 역량 강화",
    sub: "8차시 · 동영상",
    stage: "lms",
    progress: 90,
    due: "2026.06.06",
    dleft: 4,
    vendor: "러닝스퀘어",
    owner: {
      name: "최민아",
      initial: "최",
      c: "blue"
    },
    update: "LMS 1~6차시 포팅 완료",
    updatedAt: "1시간 전",
    risk: {
      level: "duesoon",
      text: "마감 임박 — 포팅 2차시 남음"
    },
    next: "포팅 진행 확인",
    missing: 0,
    approvals: 1,
    feedback: 0
  }, {
    id: "p5",
    title: "유아 놀이중심 교육과정",
    sub: "12차시 · 인터랙티브",
    stage: "story",
    progress: 41,
    due: "2026.07.15",
    dleft: 43,
    vendor: "에듀비전",
    owner: {
      name: "김정수",
      initial: "김",
      c: "orange"
    },
    update: "스토리보드 4차시 검토 중",
    updatedAt: "어제",
    risk: null,
    next: "스토리보드 확인",
    missing: 0,
    approvals: 0,
    feedback: 0
  }, {
    id: "p6",
    title: "특수교육 보조공학 활용",
    sub: "9차시 · 동영상",
    stage: "qa",
    progress: 96,
    due: "2026.06.04",
    dleft: 2,
    vendor: "러닝스퀘어",
    owner: {
      name: "박지훈",
      initial: "박",
      c: "teal"
    },
    update: "QA 검수 의견 반영 완료",
    updatedAt: "2시간 전",
    risk: {
      level: "duesoon",
      text: "마감 임박 — 최종 승인만 남음"
    },
    next: "최종 승인하기",
    missing: 0,
    approvals: 1,
    feedback: 0
  }],
  // task / alert column
  tasks: [{
    id: "t1",
    kind: "approval",
    text: "특수교육 보조공학 · 최종 승인",
    pid: "p6",
    due: "오늘"
  }, {
    id: "t2",
    kind: "feedback",
    text: "초등 디지털 리터러시 · 대본 의견 응답",
    pid: "p2",
    due: "오늘"
  }, {
    id: "t3",
    kind: "missing",
    text: "정보보안 교육 · 자막 파일 요청",
    pid: "p3",
    due: "오늘"
  }, {
    id: "t4",
    kind: "delay",
    text: "신규 교사 직무연수 · 강사 일정 재확인",
    pid: "p1",
    due: "내일"
  }, {
    id: "t5",
    kind: "approval",
    text: "학부모 상담 · LMS 포팅 승인",
    pid: "p4",
    due: "내일"
  }],
  deadlines: [{
    id: "d1",
    title: "특수교육 보조공학 활용",
    date: "06.04",
    dleft: 2,
    stage: "qa"
  }, {
    id: "d2",
    title: "학부모 상담 역량 강화",
    date: "06.06",
    dleft: 4,
    stage: "lms"
  }, {
    id: "d3",
    title: "교직원 정보보안 교육",
    date: "06.10",
    dleft: 8,
    stage: "edit"
  }, {
    id: "d4",
    title: "신규 교사 직무연수",
    date: "06.18",
    dleft: 16,
    stage: "film"
  }],
  activity: [{
    id: "a1",
    who: "박지훈",
    initial: "박",
    c: "teal",
    text: "QA 검수 의견을 반영했어요",
    at: "2시간 전",
    pid: "p6"
  }, {
    id: "a2",
    who: "최민아",
    initial: "최",
    c: "blue",
    text: "LMS 1~6차시 포팅을 완료했어요",
    at: "1시간 전",
    pid: "p4"
  }, {
    id: "a3",
    who: "이서연",
    initial: "이",
    c: "violet",
    text: "2차시 대본 검토를 요청했어요",
    at: "어제",
    pid: "p2"
  }, {
    id: "a4",
    who: "미디어랩",
    initial: "미",
    c: "orange",
    text: "3차시 편집본을 업로드했어요",
    at: "5시간 전",
    pid: "p3"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coursedev-hub/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coursedev-hub/primitives.jsx
try { (() => {
// CourseDev Hub — shared UI primitives (atoms)
const {
  useState,
  useEffect,
  useRef
} = React;

// Lucide icon wrapper -> renders an <i data-lucide> then upgrades it
function Icon({
  name,
  size = 18,
  color,
  style,
  strokeWidth = 1.75
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = "";
      const el = document.createElement("i");
      el.setAttribute("data-lucide", name);
      ref.current.appendChild(el);
      window.lucide.createIcons({
        attrs: {
          width: size,
          height: size,
          "stroke-width": strokeWidth
        },
        nameAttr: "data-lucide"
      });
    }
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: "cdh-ico",
    style: {
      display: "inline-flex",
      width: size,
      height: size,
      color,
      ...style
    }
  });
}
const AV_COLORS = {
  orange: {
    bg: "#FFD8C9",
    fg: "#B7521F"
  },
  violet: {
    bg: "#E0D6F5",
    fg: "#5B45A8"
  },
  teal: {
    bg: "#CFE6E2",
    fg: "#1E7E73"
  },
  blue: {
    bg: "#D5E3F2",
    fg: "#245C92"
  },
  gray: {
    bg: "#E7E9ED",
    fg: "#515862"
  }
};
function Avatar({
  initial,
  c = "orange",
  size = 28
}) {
  const col = AV_COLORS[c] || AV_COLORS.orange;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      flex: "none",
      background: col.bg,
      color: col.fg,
      fontWeight: 700,
      fontSize: size * 0.42,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, initial);
}
function StageChip({
  stage
}) {
  const s = window.CDH_DATA.stages[stage];
  if (!s) return null;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: "4px 10px",
      whiteSpace: "nowrap",
      borderRadius: 999,
      background: `var(--stage-${s.token}-bg)`,
      color: `var(--stage-${s.token}-fg)`
    }
  }, s.ko);
}

// risk/alert pill -> maps level to semantic color + icon
const RISK = {
  delay: {
    icon: "alert-triangle",
    bg: "var(--error-bg)",
    fg: "var(--error-fg)"
  },
  missing: {
    icon: "file-x",
    bg: "var(--info-bg)",
    fg: "var(--info-fg)"
  },
  feedback: {
    icon: "message-square",
    bg: "var(--warning-bg)",
    fg: "var(--warning-fg)"
  },
  duesoon: {
    icon: "clock",
    bg: "var(--warning-bg)",
    fg: "var(--warning-fg)"
  },
  approval: {
    icon: "stamp",
    bg: "var(--warning-bg)",
    fg: "var(--warning-fg)"
  }
};
function RiskTag({
  level,
  text,
  full
}) {
  const r = RISK[level] || RISK.delay;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12.5,
      fontWeight: 600,
      color: r.fg,
      background: r.bg,
      padding: "5px 10px",
      borderRadius: 999,
      lineHeight: 1.3,
      width: full ? "100%" : "auto"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.icon,
    size: 13,
    color: r.fg
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: full ? "normal" : "nowrap"
    }
  }, text));
}
function Progress({
  value,
  danger
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 7,
      background: "var(--bg-sunken)",
      borderRadius: 999,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: value + "%",
      borderRadius: 999,
      background: danger ? "var(--warning)" : "var(--primary)",
      transition: "width .4s cubic-bezier(.2,.8,.2,1)"
    }
  }));
}
function Button({
  variant = "pri",
  icon,
  iconRight,
  children,
  onClick,
  size = "md",
  style
}) {
  const sizes = {
    md: "10px 16px",
    sm: "7px 12px"
  };
  const base = {
    fontFamily: "var(--font-sans)",
    fontSize: size === "sm" ? 13 : 14,
    fontWeight: 600,
    borderRadius: "var(--r-md)",
    padding: sizes[size],
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    border: "1px solid transparent",
    transition: "all .14s ease-out",
    whiteSpace: "nowrap",
    ...style
  };
  const variants = {
    pri: {
      background: "var(--primary)",
      color: "#fff"
    },
    sec: {
      background: "#fff",
      color: "var(--fg-1)",
      borderColor: "var(--border-strong)"
    },
    ter: {
      background: "transparent",
      color: "var(--primary)",
      padding: "8px 6px"
    },
    ghost: {
      background: "var(--bg-sunken)",
      color: "var(--fg-2)"
    }
  };
  const [hover, setHover] = useState(false);
  const hov = {
    pri: {
      background: "var(--primary-hover)"
    },
    sec: {
      background: "var(--primary-tint-2)",
      borderColor: "var(--primary)"
    },
    ter: {
      background: "var(--primary-tint)"
    },
    ghost: {
      background: "#E8EAEE"
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...variants[variant],
      ...(hover ? hov[variant] : {})
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: size === "sm" ? 14 : 16,
    color: "currentColor"
  }), children, iconRight && /*#__PURE__*/React.createElement(Icon, {
    name: iconRight,
    size: size === "sm" ? 14 : 16,
    color: "currentColor"
  }));
}
Object.assign(window, {
  Icon,
  Avatar,
  StageChip,
  RiskTag,
  Progress,
  Button,
  AV_COLORS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coursedev-hub/primitives.jsx", error: String((e && e.message) || e) }); }

})();
