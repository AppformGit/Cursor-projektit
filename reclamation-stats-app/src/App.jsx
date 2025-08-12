import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ReferenceLine } from "recharts";
import "./App.css";

function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock data for the new dashboard layout
    setTimeout(() => {
      setStats({
        newestReclamation: {
          date: "20.6.2025",
          product: "Product XYZ",
          customer: "Customer ABC",
          reason: "Quality issue - Defective components in batch #12345, affecting 15% of units. Root cause identified as supplier material variance."
        },
        daysSincePrevious: 45,
        daysUntilReward: 15,
        longestStreak: 100,
        currentStreak: 45,
        reward: "Team lunch",
        streakStartDate: "20.7.2025", // Day-level accuracy for streak start
        // Reclamations per month data (roughly 30 total for the year)
        trendData: [
          { month: "Jan", reclamations: 4 },
          { month: "Feb", reclamations: 3 },
          { month: "Mar", reclamations: 5 },
          { month: "Apr", reclamations: 2 },
          { month: "May", reclamations: 3 },
          { month: "Jun", reclamations: 1 },
          { month: "Jul", reclamations: 0 },
          { month: "Aug", reclamations: 0 },
          { month: "Sep", reclamations: 0 },
          { month: "Oct", reclamations: 0 },
          { month: "Nov", reclamations: 0 },
          { month: "Dec", reclamations: 0 },
        ],
        previousYearTotal: 36
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="dashboard-container"><div className="loading">Loading...</div></div>;
  if (error) return <div className="dashboard-container"><div className="error">Error: {error}</div></div>;

  const streakDiff = stats.longestStreak - stats.currentStreak;
  const streakDiffPercentage = (streakDiff / stats.longestStreak) * 100;

  // Message design system based on days without reclamations
  const days = stats.daysSincePrevious || 0;
  let messageClass = "tier-10";
  let messageIconSvg = null;
  let messageText = "10+ days without reclamations.";

  if (days < 10) {
    messageClass = "tier-0";
    messageText = "Under 10 days since the last reclamation. Let's stabilize.";
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M109-120q-11 0-20-5.5T75-140q-5-9-5.5-19.5T75-180l370-640q6-10 15.5-15t19.5-5q10 0 19.5 5t15.5 15l370 640q6 10 5.5 20.5T885-140q-5 9-14 14.5t-20 5.5H109Zm69-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm0-120q17 0 28.5-11.5T520-400v-120q0-17-11.5-28.5T480-560q-17 0-28.5 11.5T440-520v120q0 17 11.5 28.5T480-360Zm0-100Z"/>
      </svg>
    );
  } else if (days < 20) {
    messageClass = "tier-10";
    messageText = "10+ days without reclamations – good momentum!";
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M840-640q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14H280v-520l240-238q15-15 35.5-17.5T595-888q19 10 28 28t4 37l-45 183h258Zm-480 34v406h360l120-280v-80H480l54-220-174 174ZM160-120q-33 0-56.5-23.5T80-200v-360q0-33 23.5-56.5T160-640h120v80H160v360h120v80H160Zm200-80v-406 406Z"/>
      </svg>
    );
  } else if (days < 30) {
    messageClass = "tier-20";
    messageText = "20+ days without reclamations – trending well!";
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M480-260q53 0 100.5-23t76.5-67q11-17 3-33.5T634-400q-8 0-14.5 3.5T609-386q-23 31-57 48.5T480-320q-38 0-72-17.5T351-386q-5-7-11.5-10.5T325-400q-18 0-26 16t3 32q29 45 76.5 68.5T480-260Zm140-260q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/>
      </svg>
    );
  } else if (days < 60) {
    messageClass = "tier-30";
    messageText = "30+ days without reclamations – great streak!";
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143Zm126 18L314-169q-11 7-23 6t-21-8q-9-7-14-17.5t-2-23.5l44-189-147-127q-10-9-12.5-20.5T140-571q4-11 12-18t22-9l194-17 75-178q5-12 15.5-18t21.5-6q11 0 21.5 6t15.5 18l75 178 194 17q14 2 22 9t12 18q4 11 1.5 22.5T809-528L662-401l44 189q3 13-2 23.5T690-171q-9 7-21 8t-23-6L480-269Zm0-201Z"/>
      </svg>
    );
  } else if (days < 90) {
    messageClass = "tier-60";
    messageText = "60+ days without reclamations – trophy-worthy!";
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M440-200v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80q0-33 23.5-56.5T360-840h240q33 0 56.5 23.5T680-760h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h120q17 0 28.5 11.5T680-160q0 17-11.5 28.5T640-120H320q-17 0-28.5-11.5T280-160q0-17 11.5-28.5T320-200h120ZM280-528v-152h-80v40q0 38 22 68.5t58 43.5Zm200 128q50 0 85-35t35-85v-240H360v240q0 50 35 85t85 35Zm200-128q36-13 58-43.5t22-68.5v-40h-80v152Zm-200-52Z"/>
      </svg>
    );
  } else if (days < 120) {
    messageClass = "tier-90";
    messageText = "90+ days without reclamations – exceptional!";
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M480-165q-17 0-33-7.5T419-194L113-560q-9-11-13.5-24T95-611q0-9 1.5-18.5T103-647l75-149q11-20 29.5-32t41.5-12h462q23 0 41.5 12t29.5 32l75 149q5 8 6.5 17.5T865-611q0 14-4.5 27T847-560L541-194q-12 14-28 21.5t-33 7.5Zm-95-475h190l-60-120h-70l-60 120Zm55 347v-267H218l222 267Zm80 0 222-267H520v267Zm144-347h106l-60-120H604l60 120Zm-474 0h106l60-120H250l-60 120Z"/>
      </svg>
    );
  } else {
    messageClass = "tier-120";
    messageText = "120+ days without reclamations – crown level performance!";
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M240-160q-17 0-28.5-11.5T200-200q0-17 11.5-28.5T240-240h480q17 0 28.5 11.5T760-200q0 17-11.5 28.5T720-160H240Zm28-140q-29 0-51.5-19T189-367l-40-254q-2 0-4.5.5t-4.5.5q-25 0-42.5-17.5T80-680q0-25 17.5-42.5T140-740q25 0 42.5 17.5T200-680q0 7-1.5 13t-3.5 11l125 56 125-171q-11-8-18-21t-7-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820q0 15-7 28t-18 21l125 171 125-56q-2-5-3.5-11t-1.5-13q0-25 17.5-42.5T820-740q25 0 42.5 17.5T880-680q0 25-17.5 42.5T820-620q-2 0-4.5-.5t-4.5-.5l-40 254q-5 29-27.5 48T692-300H268Zm0-80h424l26-167-46 20q-26 11-53 4t-44-30l-95-131-95 131q-17 23-44 30t-53-4l-46-20 26 167Zm212 0Z"/>
      </svg>
    );
  }

  // Month-over-month trend percentage for the Trends card
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const previousMonthIdx = (currentMonthIdx + 11) % 12;
  const currentMonthName = monthNames[currentMonthIdx];
  const previousMonthName = monthNames[previousMonthIdx];
  const currentMonthData = stats.trendData.find(d => d.month === currentMonthName) || { reclamations: 0 };
  const previousMonthData = stats.trendData.find(d => d.month === previousMonthName) || { reclamations: 0 };
  const prevVal = previousMonthData.reclamations || 0;
  const currVal = currentMonthData.reclamations || 0;
  const rawChange = prevVal === 0 ? (currVal === 0 ? 0 : 100) : ((currVal - prevVal) / prevVal) * 100;
  const trendPercent = Math.round(rawChange);
  const trendText = trendPercent === 0 ? "no change from last month" : (trendPercent > 0 ? "increase from last month" : "decrease from last month");
  const trendDeltaClass = trendPercent > 0 ? 'delta-positive' : (trendPercent < 0 ? 'delta-negative' : 'delta-neutral');
  const monthCaption = trendPercent === 0 ? "No change from last month" : (trendPercent > 0 ? "Increase from last month" : "Decrease from last month");

  // Year totals and YoY percentage
  const yearTotal = stats.trendData.reduce((sum, m) => sum + m.reclamations, 0);
  const prevYearTotal = stats.previousYearTotal || 0;
  const rawYearChange = prevYearTotal === 0 ? (yearTotal === 0 ? 0 : 100) : ((yearTotal - prevYearTotal) / prevYearTotal) * 100;
  const yearPercent = Math.round(rawYearChange);
  const yearDeltaClass = yearPercent > 0 ? 'delta-positive' : (yearPercent < 0 ? 'delta-negative' : 'delta-neutral');
  const yearCaption = yearPercent === 0 ? "No change from last year" : (yearPercent > 0 ? "Increase from last year" : "Decrease from last year");

  // Shorten newest reclamation reason to just a keyword before a dash
  const shortReason = (stats.newestReclamation.reason || '').split('-')[0].trim() || stats.newestReclamation.reason;

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="top-row">
          <div className="top-left">
            {/* Top-Left Card: Newest reclamation */}
            <div className="dashboard-card">
              <h2 className="card-title">Newest reclamation</h2>
              <div className="card-content">
                <div className="date-display">
                  <span className="material-symbols-rounded" aria-hidden>calendar_month</span>
                  <span className="date-text">{stats.newestReclamation.date}</span>
                </div>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">Product:</span>
                    <span className="detail-value">{stats.newestReclamation.product}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Customer:</span>
                    <span className="detail-value">{stats.newestReclamation.customer}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value">{shortReason}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="top-right">
            {/* Top-Right Card: Days since previous reclamation */}
            <div className="dashboard-card">
              <h2 className="card-title">Days since previous reclamation</h2>
              <div className="card-content">
              <div className="count-display">
                <span className="material-symbols-rounded" aria-hidden>calendar_month</span>
                <span className="count-number">{stats.daysSincePrevious}</span>
              </div>
                <div className="trend-chart">
                  <ResponsiveContainer width="100%" height={230}>
                    <AreaChart data={stats.trendData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#CBD4DD" strokeOpacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="reclamations" 
                        stroke="#005CB8" 
                        strokeWidth={3}
                        dot={{ fill: "#005CB8", strokeWidth: 2, r: 4 }}
                      />
                      <ReferenceLine 
                        x="Jun" 
                        stroke="#60C14A" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        label={{ value: "Previous reclamation", position: 'insideTopLeft', fill: '#60C14A', fontSize: 11 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className={`message-bubble ${messageClass}`}>
                  {messageIconSvg}
                  <span className="message-text">{messageText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: 3 equal cards */}
        <div className="bottom-row">
          {/* New Bottom-Left Card: Reclamations this year */}
          <div className="dashboard-card">
            <h2 className="card-title">Reclamations this year</h2>
            <div className="card-content">
                <div className="count-display">
                  <span className="material-symbols-rounded" aria-hidden>warning</span>
                  <span className="count-number">{yearTotal}</span>
                </div>
              <span className={`trend-delta ${yearDeltaClass}`}>{yearPercent > 0 ? `+${yearPercent}%` : `${yearPercent}%`}</span>
              <div className="trend-caption">{yearCaption}</div>
            </div>
          </div>

          {/* Middle Bottom Card: Reclamations this month */}
          <div className="dashboard-card">
            <h2 className="card-title">Reclamations this month</h2>
            <div className="card-content">
                <div className="count-display">
                  <span className="material-symbols-rounded" aria-hidden>warning</span>
                  <span className="count-number">{currVal}</span>
                </div>
              <span className={`trend-delta ${trendDeltaClass}`}>{trendPercent > 0 ? `+${trendPercent}%` : `${trendPercent}%`}</span>
              <div className="trend-caption">{monthCaption}</div>
            </div>
          </div>

          {/* Bottom-Right Card: Longest streak without reclamations */}
          <div className="dashboard-card">
            <h2 className="card-title">Longest streak without reclamations</h2>
            <div className="card-content">
              <div className="count-display">
                <span className="material-symbols-rounded" aria-hidden>calendar_month</span>
                <span className="count-number">{stats.longestStreak}</span>
              </div>
              <div className="progress-section">
                <div className="progress-item">
                  <div className="progress-label">Current streak vs Record streak</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill current-streak" 
                      style={{ width: `${streakDiffPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;