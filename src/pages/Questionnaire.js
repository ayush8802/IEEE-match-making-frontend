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

    const [hasExistingData, setHasExistingData] = useState(false);

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

    /**
     * Load existing user answers and pre-fill the form
     * Handles all field types including arrays, objects, and special fields
     */
    useEffect(() => {
        async function load() {
            try {
                const response = await getQuestionnaire();
                console.log("Questionnaire API Response (full):", response); // Debug log
                
                // apiRequest returns response.data from axios
                // Backend returns: { success: true, data: {...} }
                // So response is: { success: true, data: {...} }
                const data = response?.data || null;
                console.log("Questionnaire Data (extracted):", data); // Debug log
                console.log("Data type:", typeof data, "Is null?", data === null, "Keys:", data ? Object.keys(data) : []); // Debug log

                // Only process if data exists and has properties (not null)
                if (data && typeof data === 'object' && data !== null && Object.keys(data).length > 0) {
                    console.log("Pre-filling form with data:", data); // Debug log
                    const prefill = { ...data };
                    const loadedCustomOptions = {};

                    // Handle special research questions (problems_top_questions)
                    if (Array.isArray(data.problems_top_questions)) {
                        data.problems_top_questions.forEach((q, i) => {
                            prefill[`problems_top_questions_q${i + 1}`] = q.question || "";
                            prefill[`problems_top_questions_q${i + 1}_readiness`] = q.readiness || null;
                            prefill[`problems_top_questions_q${i + 1}_priority`] = q.priority || null;
                        });
                    }

                    // Handle top 3 collaboration topics
                    if (Array.isArray(data.top_3_collab_topics)) {
                        prefill.top_3_collab_topics = data.top_3_collab_topics;
                    }

                    // Handle "Other" fields and custom options - iterate through all questions
                    questionsData.forEach((sec) => {
                        sec.items.forEach((q) => {
                            // Handle "Other" fields for single-select
                            if (q.allowOther && data[q.key]) {
                                const value = data[q.key];
                                const predefinedOptions = q.options || [];
                                
                                // If value is not in predefined options, it's an "Other" value
                                if (!predefinedOptions.includes(value) && value !== "Other") {
                                    prefill[q.key] = "Other";
                                    prefill[`${q.key}_other`] = value;
                                    
                                    // Add to custom options if not already there
                                    if (!loadedCustomOptions[q.key]) {
                                        loadedCustomOptions[q.key] = [];
                                    }
                                    if (!loadedCustomOptions[q.key].includes(value)) {
                                        loadedCustomOptions[q.key].push(value);
                                    }
                                }
                            }

                            // Handle multi-select custom options
                            if (q.type === "multi-select" && Array.isArray(data[q.key])) {
                                const selectedValues = data[q.key];
                                const predefinedOptions = q.options || [];
                                
                                selectedValues.forEach((val) => {
                                    if (!predefinedOptions.includes(val)) {
                                        if (!loadedCustomOptions[q.key]) {
                                            loadedCustomOptions[q.key] = [];
                                        }
                                        if (!loadedCustomOptions[q.key].includes(val)) {
                                            loadedCustomOptions[q.key].push(val);
                                        }
                                    }
                                });
                            }

                            // Handle single-select custom options (non-Other)
                            if (q.type === "single-select" && data[q.key] && !q.allowOther) {
                                const value = data[q.key];
                                const predefinedOptions = q.options || [];
                                
                                if (!predefinedOptions.includes(value) && value !== "Other") {
                                    if (!loadedCustomOptions[q.key]) {
                                        loadedCustomOptions[q.key] = [];
                                    }
                                    if (!loadedCustomOptions[q.key].includes(value)) {
                                        loadedCustomOptions[q.key].push(value);
                                    }
                                }
                            }
                        });
                    });

                    // Set custom options
                    if (Object.keys(loadedCustomOptions).length > 0) {
                        setCustomOptions(loadedCustomOptions);
                    }

                    // Set form data with all pre-filled values
                    setFormData(prefill);
                    setHasExistingData(true);
                    console.log("Form pre-filled successfully with:", prefill); // Debug log
                } else {
                    console.log("No questionnaire data found for user"); // Debug log
                    setHasExistingData(false);
                }
                // If no data exists, formData remains empty (new user)
            } catch (error) {
                console.error("Error loading questionnaire:", error);
                console.error("Error details:", error.message, error.status, error.data); // Debug log
                setHasExistingData(false);
                // Continue with empty form - user can fill it in as a new questionnaire
            } finally {
                setIsLoading(false);
            }
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

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
            setHasExistingData(true); // Mark that data now exists
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

    const section = sections[sectionIndex];

    return (
        <div className="questionnaire-container">
            <div className="section-card">
                {hasExistingData && (
                    <div className="prefilled-notice" style={{
                        background: 'linear-gradient(135deg, rgba(212, 126, 48, 0.1) 0%, rgba(212, 126, 48, 0.05) 100%)',
                        border: '2px solid var(--color-accent)',
                        borderRadius: '12px',
                        padding: '1rem 1.5rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        animation: 'slideDown 0.3s ease'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>📝</span>
                        <div style={{ flex: 1 }}>
                            <strong style={{ color: 'var(--color-accent)', display: 'block', marginBottom: '0.25rem' }}>
                                Your Previous Responses
                            </strong>
                            <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                                Your saved responses are pre-filled below. You can edit any field and submit to update your questionnaire.
                            </p>
                        </div>
                    </div>
                )}
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
                                        // Safely access topic from array, ensuring it's an array first
                                        const topicsArray = Array.isArray(formData[q.key]) ? formData[q.key] : [];
                                        const topic = topicsArray[n - 1] || { topic: "", expertise: 0, interest: 0, need_have_both: "" };

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
