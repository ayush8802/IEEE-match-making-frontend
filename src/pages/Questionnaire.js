/**
 * Questionnaire Page
 * Multi-step questionnaire form with validation
 */

import React, { useState, useEffect } from "react";
import questionsData from "../data/questions";
import { saveQuestionnaire, getQuestionnaire } from "../services/questionnaireService";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/questionnaire.css";

export default function Questionnaire() {
    const [sections] = useState(questionsData);
    const [sectionIndex, setSectionIndex] = useState(0);
    const [formData, setFormData] = useState({});
    const [customOptions, setCustomOptions] = useState({});
    const [showAddInputFor, setShowAddInputFor] = useState(null);
    const [addInputValue, setAddInputValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [isViewMode, setIsViewMode] = useState(false);

    const isShortTextType = (t) =>
        t === "short-text" || t === "short text" || t === "shorttext";

    const mergedOptionsFor = (q) => {
        const predefined = q.options || [];
        const custom = customOptions[q.key] || [];
        const combined = [...predefined];
        for (const c of custom) if (!combined.includes(c)) combined.push(c);
        return combined;
    };

    function LikertInline({ name, value, onChange, readOnly = false }) {
        return (
            <div className="likert-inline">
                {[1, 2, 3, 4, 5].map((n) => {
                    const isSelected = Number(value) === n;
                    return (
                        <label key={n} className={`likert-label ${isSelected ? "selected" : ""} ${readOnly ? "readonly" : ""}`}>
                            <input
                                type="radio"
                                name={name}
                                value={n}
                                checked={isSelected}
                                onChange={() => !readOnly && onChange && onChange(n)}
                                disabled={readOnly}
                            />
                            <span className="likert-value">{n}</span>
                        </label>
                    );
                })}
            </div>
        );
    }

    const handleChange = (key, value, type) => {
        setFormData((prev) => {
            const next = { ...prev };
            if (type === "multi-select") {
                const current = Array.isArray(next[key]) ? [...next[key]] : [];
                const idx = current.indexOf(value);
                if (idx >= 0) current.splice(idx, 1);
                else current.push(value);
                next[key] = current;
            } else {
                next[key] = value;
            }
            return next;
        });
    };

    const addCustomOption = (qKey, value) => {
        if (!value || !value.trim()) return;
        const val = value.trim();
        setCustomOptions((prev) => {
            const next = { ...prev };
            next[qKey] = next[qKey] ? [...next[qKey]] : [];
            if (!next[qKey].includes(val)) next[qKey].push(val);
            return next;
        });

        const q = findQuestionByKey(qKey);
        if (!q) return;

        if (q.type === "multi-select") {
            setFormData((prev) => ({ ...prev, [qKey]: [...(prev[qKey] || []), val] }));
        } else if (q.type === "single-select") {
            setFormData((prev) => ({ ...prev, [qKey]: val }));
        }

        setAddInputValue("");
        setShowAddInputFor(null);
    };

    const findQuestionByKey = (key) => {
        for (const sec of sections) {
            for (const it of sec.items) if (it.key === key) return it;
        }
        return null;
    };

    const validateSection = () => {
        const sec = sections[sectionIndex];
        for (const q of sec.items) {
            if (!q.required) continue;

            if (q.type === "special-research-questions") {
                let anyFilled = false;
                for (let i = 1; i <= 3; i++) {
                    const textKey = `${q.key}_q${i}`;
                    if (formData[textKey] && formData[textKey].trim()) anyFilled = true;
                }
                if (!anyFilled) {
                    alert(`Please fill at least one research question in "${q.question}"`);
                    return false;
                }
                continue;
            }

            const val = formData[q.key];
            if (q.type === "multi-select") {
                if (!val || !Array.isArray(val) || val.length === 0) {
                    alert(`Please complete: "${q.question}"`);
                    return false;
                }
            } else if (q.type === "single-select") {
                if (!val || (val === "Other" && !formData[`${q.key}_other`])) {
                    alert(`Please complete: "${q.question}"`);
                    return false;
                }
            } else if (isShortTextType(q.type) && (!val || !val.trim())) {
                alert(`Please complete: "${q.question}"`);
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (!validateSection()) return;
        if (sectionIndex < sections.length - 1) setSectionIndex(sectionIndex + 1);
    };

    const handleBack = () => {
        if (sectionIndex > 0) setSectionIndex(sectionIndex - 1);
    };

    // Load existing user answers
    useEffect(() => {
        async function load() {
            try {
                const response = await getQuestionnaire();
                // apiRequest returns response.data, which is { success: true, data: ... }
                // So we need to access the nested data property
                // Handle null or undefined by defaulting to empty object
                const data = response?.data || {};

                // Only process if data is a valid object with properties
                if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    const prefill = { ...data };
                    if (Array.isArray(data.problems_top_questions)) {
                        data.problems_top_questions.forEach((q, i) => {
                            prefill[`problems_top_questions_q${i + 1}`] = q.question || "";
                            prefill[`problems_top_questions_q${i + 1}_readiness`] = q.readiness || null;
                            prefill[`problems_top_questions_q${i + 1}_priority`] = q.priority || null;
                        });
                    }
                    if (Array.isArray(data.top_3_collab_topics)) {
                        prefill.top_3_collab_topics = data.top_3_collab_topics;
                    }
                    prefill.linkedin_url = data.linkedin_url || "";
                    setFormData(prefill);
                    setIsViewMode(true); // Enable View Mode if data exists
                }
                // If no data exists, formData remains empty (new user) - no error needed
            } catch (error) {
                // Log errors silently for debugging, don't show popup to user
                console.error("Error loading questionnaire:", error);
                // Just continue with empty form - user can fill it in as a new questionnaire
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    const handleSubmit = async () => {
        if (!validateSection()) return;

        try {
            setIsSubmitting(true);

            const answersPayload = { ...formData };

            // SPECIAL RESEARCH QUESTIONS (problems_top_questions)
            const specialQuestions = [];
            const srq = findQuestionByKey("problems_top_questions");
            if (srq) {
                for (let i = 1; i <= 3; i++) {
                    const question = formData[`problems_top_questions_q${i}`];
                    if (question && question.trim()) {
                        specialQuestions.push({
                            question,
                            readiness: formData[`problems_top_questions_q${i}_readiness`] || null,
                            priority: formData[`problems_top_questions_q${i}_priority`] || null,
                        });
                    }
                }
            }
            answersPayload.problems_top_questions = specialQuestions;

            // Cleanup temporary flattened keys from payload to pass backend validation
            for (let i = 1; i <= 3; i++) {
                delete answersPayload[`problems_top_questions_q${i}`];
                delete answersPayload[`problems_top_questions_q${i}_readiness`];
                delete answersPayload[`problems_top_questions_q${i}_priority`];
            }

            // Cleanup "Other" fields: if key_other exists, use its value for key and delete key_other
            Object.keys(answersPayload).forEach(key => {
                if (key.endsWith("_other")) {
                    const baseKey = key.replace("_other", "");
                    if (answersPayload[baseKey] === "Other" && answersPayload[key]) {
                        answersPayload[baseKey] = answersPayload[key];
                    }
                    delete answersPayload[key];
                }
            });

            // Handle top 3 collaboration topics
            const collabTopics = [];
            const topicsArray = formData.top_3_collab_topics || [];
            for (let i = 0; i < topicsArray.length; i++) {
                const t = topicsArray[i];
                if (t.topic && t.topic.trim()) {
                    collabTopics.push({
                        topic: t.topic.trim(),
                        expertise: t.expertise || null,
                        interest: t.interest || null,
                        need_have_both: t.need_have_both || null,
                    });
                }
            }
            answersPayload.top_3_collab_topics = collabTopics;

            // Submit using service
            await saveQuestionnaire(answersPayload);
            alert("✅ Submitted successfully!");
            setIsViewMode(true); // Switch to View Mode after submit
        } catch (err) {
            console.error("Submit error:", err);
            alert("Submit failed: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading questionnaire..." />;
    }

    // View Mode Rendering
    if (isViewMode) {
        return (
            <div className="questionnaire-container">
                <div className="section-card">
                    <h2>Your Saved Response</h2>
                    <p style={{ marginBottom: '20px', color: 'var(--color-text-light)' }}>
                        You have already submitted a questionnaire. You can view your answers below or click "Edit" to make changes.
                    </p>

                    {sections.map((sec, sIdx) => (
                        <div key={sIdx} className="summary-section" style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-accent)' }}>{sec.section}</h3>
                            {sec.items.map((q, qIdx) => {
                                let content = null;

                                if (q.type === "top-3-collab-topics") {
                                    const topics = formData[q.key] || [];
                                    if (topics.length === 0) content = <span style={{ fontStyle: 'italic', color: 'var(--color-text-light)' }}>No topics added</span>;
                                    else {
                                        content = topics.map((t, i) => (
                                            <div key={i} style={{ marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid var(--color-border)' }}>
                                                <div><strong>Topic:</strong> {t.topic}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                                    Expertise: {t.expertise}/5 | Interest: {t.interest}/5 | {t.need_have_both}
                                                </div>
                                            </div>
                                        ));
                                    }
                                } else if (q.type === "special-research-questions") {
                                    const items = [];
                                    for (let i = 1; i <= 3; i++) {
                                        const qt = formData[`${q.key}_q${i}`];
                                        if (qt) {
                                            items.push(
                                                <div key={i} style={{ marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid var(--color-border)' }}>
                                                    <div><strong>Q{i}:</strong> {qt}</div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                                        Readiness: {formData[`${q.key}_q${i}_readiness`] || 0}/5 | Priority: {formData[`${q.key}_q${i}_priority`] || 0}/5
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }
                                    content = items.length > 0 ? items : <span style={{ fontStyle: 'italic', color: 'var(--color-text-light)' }}>No questions answered</span>;
                                } else {
                                    // Simple types
                                    const val = formData[q.key];
                                    if (!val) content = <span style={{ fontStyle: 'italic', color: 'var(--color-text-light)' }}>Not answered</span>;
                                    else if (Array.isArray(val)) content = val.join(", ");
                                    else content = val.toString();
                                }

                                return (
                                    <div key={qIdx} style={{ marginBottom: '16px' }}>
                                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>{q.question}</strong>
                                        <div style={{ color: 'var(--color-text-main)' }}>{content}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    <div className="nav-buttons">
                        <button className="submit-btn" onClick={() => setIsViewMode(false)}>Edit Response</button>
                    </div>
                </div>
            </div>
        );
    }

    const section = sections[sectionIndex];

    return (
        <div className="questionnaire-container">
            <div className="section-card">
                <h2>{section.section}</h2>
                {section.items.map((q, idx) => {
                    const mergedOptions = q.type === "multi-select" || q.type === "single-select" ? mergedOptionsFor(q) : [];
                    return (
                        <div key={idx} className="question-block">
                            <p className="question-text">
                                {q.question} {q.required && <span className="required">*</span>}
                            </p>

                            {/* SHORT TEXT */}
                            {isShortTextType(q.type) && (
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder={q.placeholder || ""}
                                    value={formData[q.key] || ""}
                                    onChange={(e) => handleChange(q.key, e.target.value, q.type)}
                                />
                            )}

                            {/* SINGLE SELECT */}
                            {q.type === "single-select" && mergedOptions.length > 0 && (
                                <div className="options">
                                    {mergedOptions.map((opt, i) => (
                                        <label key={i}>
                                            <input
                                                type="radio"
                                                name={q.key}
                                                value={opt}
                                                checked={formData[q.key] === opt}
                                                onChange={(e) => handleChange(q.key, e.target.value, q.type)}
                                            />
                                            {opt}
                                        </label>
                                    ))}

                                    {/* Other textbox */}
                                    {q.allowOther && formData[q.key] === "Other" && (
                                        <input
                                            type="text"
                                            className="text-input"
                                            placeholder="Please specify..."
                                            value={formData[`${q.key}_other`] || ""}
                                            onChange={(e) => handleChange(`${q.key}_other`, e.target.value, "short-text")}
                                        />
                                    )}

                                    {/* Add custom option */}
                                    {q.allowCustomOption && (
                                        <div className="add-option">
                                            {showAddInputFor === q.key ? (
                                                <input
                                                    className="add-option-input"
                                                    placeholder="Type new option and press Enter..."
                                                    value={addInputValue}
                                                    onChange={(e) => setAddInputValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") addCustomOption(q.key, addInputValue);
                                                        if (e.key === "Escape") {
                                                            setShowAddInputFor(null);
                                                            setAddInputValue("");
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <button className="add-option-btn" onClick={() => setShowAddInputFor(q.key)}>
                                                    + Add option
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* MULTI-SELECT */}
                            {q.type === "multi-select" && (
                                <>
                                    <div className="chip-container">
                                        {mergedOptions.map((opt, i) => {
                                            const selected = Array.isArray(formData[q.key]) && formData[q.key].includes(opt);
                                            return (
                                                <div
                                                    key={i}
                                                    className={`chip ${selected ? "selected" : ""}`}
                                                    onClick={() => handleChange(q.key, opt, q.type)}
                                                >
                                                    {opt}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {q.allowCustomOption && (
                                        <div className="add-option">
                                            {showAddInputFor === q.key ? (
                                                <input
                                                    className="add-option-input"
                                                    placeholder="Type new option and press Enter..."
                                                    value={addInputValue}
                                                    onChange={(e) => setAddInputValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") addCustomOption(q.key, addInputValue);
                                                        if (e.key === "Escape") {
                                                            setShowAddInputFor(null);
                                                            setAddInputValue("");
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <button className="add-option-btn" onClick={() => setShowAddInputFor(q.key)}>
                                                    + Add option
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* TOP 3 COLLABORATION TOPICS */}
                            {q.type === "top-3-collab-topics" && (
                                <div className="research-questions">
                                    {[1, 2, 3].map((n) => {
                                        const topicKey = `${q.key}_topic${n}`;
                                        const topic = formData[q.key]?.[n - 1] || { topic: "", expertise: 0, interest: 0, need_have_both: "" };

                                        return (
                                            <div key={n} className="research-question-item">
                                                <input
                                                    type="text"
                                                    className="text-input"
                                                    placeholder={`Topic ${n}`}
                                                    value={topic.topic}
                                                    onChange={(e) => {
                                                        const updated = [...(formData[q.key] || [])];
                                                        updated[n - 1] = { ...topic, topic: e.target.value };
                                                        handleChange(q.key, updated, "json");
                                                    }}
                                                />

                                                {topic.topic.trim() && (
                                                    <>
                                                        <div className="matrix-row small">
                                                            <div className="matrix-row-label">Expertise (1–5)</div>
                                                            <LikertInline
                                                                name={`${topicKey}_expertise`}
                                                                value={topic.expertise}
                                                                onChange={(val) => {
                                                                    const updated = [...(formData[q.key] || [])];
                                                                    updated[n - 1] = { ...topic, expertise: val };
                                                                    handleChange(q.key, updated, "json");
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="matrix-row small">
                                                            <div className="matrix-row-label">Interest to collaborate (1–5)</div>
                                                            <LikertInline
                                                                name={`${topicKey}_interest`}
                                                                value={topic.interest}
                                                                onChange={(val) => {
                                                                    const updated = [...(formData[q.key] || [])];
                                                                    updated[n - 1] = { ...topic, interest: val };
                                                                    handleChange(q.key, updated, "json");
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="matrix-row small">
                                                            <div className="matrix-row-label">Datasets/Instruments/Materials</div>
                                                            <div className="radio-group">
                                                                {["Need", "Have", "Both"].map((option) => (
                                                                    <label key={option}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`${topicKey}_need_have_both`}
                                                                            value={option}
                                                                            checked={topic.need_have_both === option}
                                                                            onChange={(e) => {
                                                                                const updated = [...(formData[q.key] || [])];
                                                                                updated[n - 1] = { ...topic, need_have_both: e.target.value };
                                                                                handleChange(q.key, updated, "json");
                                                                            }}
                                                                        />
                                                                        {option}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* SPECIAL RESEARCH QUESTIONS */}
                            {q.type === "special-research-questions" && (
                                <div className="research-questions">
                                    {[1, 2, 3].map((n) => {
                                        const textKey = `${q.key}_q${n}`;
                                        const readinessKey = `${q.key}_q${n}_readiness`;
                                        const priorityKey = `${q.key}_q${n}_priority`;

                                        return (
                                            <div key={n} className="research-question-item">
                                                <input
                                                    type="text"
                                                    className="text-input"
                                                    placeholder={`Research question ${n} (one sentence)`}
                                                    value={formData[textKey] || ""}
                                                    onChange={(e) => handleChange(textKey, e.target.value, "short-text")}
                                                />
                                                {formData[textKey] && formData[textKey].trim() && (
                                                    <>
                                                        <div className="matrix-row small">
                                                            <div className="matrix-row-label">Readiness (1-5)</div>
                                                            <LikertInline
                                                                name={readinessKey}
                                                                value={formData[readinessKey] || 0}
                                                                onChange={(val) => handleChange(readinessKey, val, "Likert")}
                                                            />
                                                        </div>
                                                        <div className="matrix-row small">
                                                            <div className="matrix-row-label">Priority this year (1-5)</div>
                                                            <LikertInline
                                                                name={priorityKey}
                                                                value={formData[priorityKey] || 0}
                                                                onChange={(val) => handleChange(priorityKey, val, "Likert")}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="nav-buttons">
                    {sectionIndex > 0 && <button className="back-btn" onClick={handleBack}>Back</button>}
                    {sectionIndex < sections.length - 1 && <button className="next-btn" onClick={handleNext}>Next</button>}
                    {sectionIndex === sections.length - 1 && (
                        <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
