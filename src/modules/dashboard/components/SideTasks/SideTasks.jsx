import "./SideTasks.css";

export default function SideTasks({ tasks }) {
  // keyinchalik API dan keladi
  const mockTasks = [
    {
      title: "Yangi restoran hujjatlarini tekshirish",
      priority: "high",
      label: "Yuqori",
    },
    {
      title: "Naqd hisobni tasdiqlash (5 ta buyurtma)",
      priority: "medium",
      label: "O‘rta",
    },
    {
      title: "Chat moderatsiya (3 ta xabar)",
      priority: "low",
      label: "Past",
    },
  ];

  const data = tasks || mockTasks;

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "task-badge high";
      case "medium":
        return "task-badge medium";
      case "low":
        return "task-badge low";
      default:
        return "task-badge";
    }
  };

  return (
    <div className="dashboard-tasks-card">
      <h3 className="dashboard-tasks-title">Qo‘shimcha ishlar</h3>

      <div className="dashboard-tasks-list">
        {data.map((task, index) => (
          <div key={index} className="dashboard-task-item">
            <p className="dashboard-task-text">{task.title}</p>
            <span className={getPriorityClass(task.priority)}>
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}