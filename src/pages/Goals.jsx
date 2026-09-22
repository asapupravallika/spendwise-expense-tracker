import React, { useEffect, useState } from "react";
import { Edit3, Goal as GoalIcon, Plus, Trash2 } from "lucide-react";
import { goalApi } from "../api";
import {
  EmojiIcon,
  ErrorBox,
  Field,
  FormActions,
  Modal,
  PageHeader,
  SuccessBox,
  getUser,
  money
} from "../components";

const blank = {
  goalName: "",
  targetAmount: "",
  currentAmount: "0",
  targetDate: "",
  description: ""
};

// Safely convert values coming from the API/form into numbers
const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

// Calculate savings progress from the actual amounts
const getGoalProgress = (currentAmount, targetAmount) => {
  const current = toNumber(currentAmount);
  const target = toNumber(targetAmount);

  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (current / target) * 100));
};

// Calculate remaining amount
const getRemainingAmount = (currentAmount, targetAmount) => {
  const current = toNumber(currentAmount);
  const target = toNumber(targetAmount);

  return Math.max(0, target - current);
};

export default function Goals() {
  const user = getUser();

  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      setError("");

      const response = await goalApi.list(user.userId);

      setRows(response.data || []);
    } catch (e) {
      setError(e.message || "Failed to load savings goals.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = (goal) => {
    if (goal) {
      setForm({
        goalName: goal.goalName || "",
        targetAmount: goal.targetAmount ?? "",
        currentAmount: goal.currentAmount ?? "0",
        targetDate: goal.targetDate || "",
        description: goal.description || "",
        id: goal.goalId
      });

      setModal(goal);
    } else {
      setForm(blank);
      setModal({});
    }

    setError("");
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const targetAmount = toNumber(form.targetAmount);
      const currentAmount = toNumber(form.currentAmount);

      if (targetAmount <= 0) {
        setError("Target amount must be greater than ₹0.");
        return;
      }

      if (currentAmount < 0) {
        setError("Already saved amount cannot be negative.");
        return;
      }

      if (currentAmount > targetAmount) {
        setError("Already saved amount cannot be greater than the target amount.");
        return;
      }

      const body = {
        userId: user.userId,
        goalName: form.goalName.trim(),
        targetAmount,
        currentAmount,
        targetDate: form.targetDate || null,
        description: form.description?.trim() || null
      };

      if (form.id) {
        await goalApi.update(user.userId, form.id, body);
      } else {
        await goalApi.create(body);
      }

      setSuccess("Savings goal saved.");
      setModal(null);
      setForm(blank);

      await load();
    } catch (e) {
      setError(e.message || "Failed to save savings goal.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this savings goal?")) {
      return;
    }

    try {
      setError("");

      await goalApi.remove(user.userId, id);

      setSuccess("Goal deleted.");

      await load();
    } catch (e) {
      setError(e.message || "Failed to delete savings goal.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="FUTURE FUND"
        title={
          <span className="title-with-emoji">
            Savings goals
            <EmojiIcon
              emoji="🎯"
              label="savings goal"
              size={40}
            />
          </span>
        }
        description="Turn a number you care about into a visible, motivating plan."
        action={
          <button
            className="primary-btn"
            onClick={() => open()}
          >
            <Plus size={17} />
            New goal
          </button>
        }
      />

      <ErrorBox message={error} />
      <SuccessBox message={success} />

      <div className="goal-grid">
        {rows.map((goal) => {
          // Calculate these values locally instead of trusting
          // progressPercentage/remainingAmount from the backend.
          const currentAmount = toNumber(goal.currentAmount);
          const targetAmount = toNumber(goal.targetAmount);

          const progressPercentage = getGoalProgress(
            currentAmount,
            targetAmount
          );

          const remainingAmount = getRemainingAmount(
            currentAmount,
            targetAmount
          );

          return (
            <div
              className="goal-card"
              key={goal.goalId}
            >
              <div className="goal-top">
                <div className="goal-icon">
                  <GoalIcon size={20} />
                </div>

                <div>
                  <b>{goal.goalName}</b>

                  <small>
                    {goal.targetDate
                      ? `Target ${goal.targetDate}`
                      : "No target date"}
                  </small>
                </div>

                <div className="row-actions">
                  <button
                    className="icon-btn"
                    onClick={() => open(goal)}
                    aria-label="Edit savings goal"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    className="icon-btn danger"
                    onClick={() => remove(goal.goalId)}
                    aria-label="Delete savings goal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="goal-number">
                <strong>
                  {money(currentAmount)}
                </strong>

                <span>
                  saved of {money(targetAmount)}
                </span>
              </div>

              <div className="progress goal">
                <i
                  style={{
                    width: `${progressPercentage}%`
                  }}
                />
              </div>

              <div className="goal-foot">
                <b>
                  {progressPercentage.toFixed(2)}%
                </b>

                <span>
                  {money(remainingAmount)} remaining
                </span>
              </div>

              {goal.description && (
                <p>{goal.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {!rows.length && (
        <div className="panel">
          <div className="empty">
            <b>No savings goals yet</b>

            <small>
              Start with something meaningful — emergency fund,
              travel, education, anything.
            </small>
          </div>
        </div>
      )}

      {modal && (
        <Modal
          title={
            modal.goalId
              ? "Edit savings goal"
              : "Create savings goal"
          }
          onClose={() => setModal(null)}
        >
          <form onSubmit={save}>
            <Field
              label="Goal name"
              required
            >
              <input
                required
                maxLength="120"
                value={form.goalName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    goalName: e.target.value
                  })
                }
                placeholder="Emergency fund"
              />
            </Field>

            <div className="form-grid">
              <Field
                label="Target amount (₹)"
                required
              >
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.targetAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetAmount: e.target.value
                    })
                  }
                  placeholder="150000"
                />
              </Field>

              <Field
                label="Already saved (₹)"
                required
              >
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.currentAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      currentAmount: e.target.value
                    })
                  }
                  placeholder="20000"
                />
              </Field>
            </div>

            <Field label="Target date">
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    targetDate: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Description">
              <textarea
                maxLength="255"
                rows="3"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value
                  })
                }
                placeholder="What are you saving for?"
              />
            </Field>

            <FormActions
              onCancel={() => setModal(null)}
              saveLabel="Save goal"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}