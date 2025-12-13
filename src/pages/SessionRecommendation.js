/**
 * Session Recommendation Page
 * Displays conference session schedule and recommendations
 * Currently uses demo data - can be connected to backend API later
 */

import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/schedule.css";
import { demoSessions } from "../data/sessions";

const SessionRecommendation = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Load session data on component mount
     * Currently uses demo data - can be replaced with API call
     */
    useEffect(() => {
        // TODO: Replace with actual API call when backend is ready
        // fetch(`${API_BASE_URL}/sessions`)
        //     .then((res) => res.json())
        //     .then((data) => {
        //         setScheduleData(data);
        //         setLoading(false);
        //     })
        //     .catch((err) => {
        //         console.error("Error fetching sessions:", err);
        //         setScheduleData(demoSessions); // Fallback to demo data
        //         setLoading(false);
        //     });

        // For now, use demo data directly
        setScheduleData(demoSessions);
        setLoading(false);
    }, []);

    // Loading state
    if (loading) {
        return <LoadingSpinner message="Loading schedule..." />;
    }

    // Main render
    return (
        <div className="schedule-container">
            <h2>Conference Schedule</h2>
            {scheduleData.map((day, index) => (
                <div className="schedule-day" key={index}>
                    <div className="day-label">{day.date}</div>

                    {day.sessions.map((session, idx) => (
                        <div
                            key={idx}
                            className={`session ${session.recommended ? "recommended" : ""}`}
                        >
                            <div className="session-title">{session.title}</div>
                            <div className="session-time">⏰ {session.time}</div>
                            <div className="session-location">📍 {session.location}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default SessionRecommendation;
