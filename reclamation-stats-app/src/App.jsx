import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ReferenceLine } from "recharts";
import "./App.css";

// Finnish translations
const translations = {
  // Page title
  pageTitle: "Tuotannon reklamaatiot",
  
  // Card titles
  newestReclamation: "Uusin reklamaatio",
  daysSincePrevious: "Päiviä edellisestä reklamaatiosta",
  reclamationsThisYear: "Reklamaatiot tänä vuonna",
  reclamationsThisMonth: "Reklamaatiot tässä kuussa",
  longestStreak: "Pisin jakso ilman reklamaatioita",
  
  // Labels
  product: "Tuote:",
  customer: "Asiakas:",
  reason: "Syy:",
  currentStreakVsRecord: "Nykyinen jakso vs Ennätys",
  
  // Messages
  under10Days: "Alle 10 päivää",
  under10DaysSub: "Vakaannutaan ja palataan raiteille.",
  days10Plus: "10+ päivää",
  days10PlusSub: "Hyvä vauhti, pidetään se tasaisena! tähän jotain tekstiä niin",
  days20Plus: "20+ päivää",
  days20PlusSub: "Hyvässä suunnassa, pysytään johdonmukaisina!",
  days30Plus: "30+ päivää",
  days30PlusSub: "Vahva kuukausi takana, hienoa yhteistyötä!",
  days60Plus: "60+ päivää",
  days60PlusSub: "Palkintokorokkeelle asti!",
  days90Plus: "90+ päivää",
  days90PlusSub: "Poikkeuksellista suoritusta!",
  days120Plus: "120+ päivää",
  days120PlusSub: "Kruunun arvoinen saavutus!",
  
  // Trend labels
  increaseFromLastMonth: "Kasvua viime kuusta",
  decreaseFromLastMonth: "Laskua viime kuusta",
  noChangeFromLastMonth: "Ei muutosta viime kuusta",
  increaseFromLastYear: "Kasvua viime vuodesta",
  decreaseFromLastYear: "Laskua viime vuodesta",
  noChangeFromLastYear: "Ei muutosta viime vuodesta",
  
  // Loading and error states
  loading: "Ladataan...",
  error: "Virhe:",
  
  // Date format
  dateRange: "15.1. - 25.3.2024"
};

function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReclamationData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/reclamations', { // Using relative URL with Vite proxy
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reclamationRecords = await response.json();
        console.log('Received data:', reclamationRecords);
        
        // Calculate all statistics from the raw data
        console.log('Raw API data received:', reclamationRecords);
        const calculatedStats = calculateStatsFromRecords(reclamationRecords);
        console.log('Calculated stats:', calculatedStats);
        setStats(calculatedStats);
      } catch (err) {
        console.error('Fetch error details:', err);
        setError(`API Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReclamationData();
  }, []);

  // Function to calculate all dashboard statistics from raw reclamation records
  const calculateStatsFromRecords = (records) => {
    try {
      console.log('Starting stats calculation with records:', records);
      
      if (!records || records.length === 0) {
        console.log('No records found, returning default stats');
        return {
          newestReclamation: null,
          daysSincePrevious: 0,
          longestStreak: 0,
          currentStreak: 0,
          longestStreakDateRange: "Ei tietoja",
          trendData: [],
          previousYearTotal: 0
        };
      }

    // Sort records by date (newest first)
    const sortedRecords = records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get newest reclamation
    const newestReclamation = sortedRecords[0];
    
    // Calculate days since previous reclamation
    const now = new Date();
    const lastReclamationDate = new Date(newestReclamation.date);
    const daysSincePrevious = Math.floor((now - lastReclamationDate) / (1000 * 60 * 60 * 24));
    
    // Calculate streaks and find longest streak
    const streakData = calculateStreaks(records);
    const longestStreak = Math.max(...streakData.streaks);
    const currentStreak = streakData.streaks[0]; // First streak is the current one (days since last reclamation)
    
    // Calculate dynamic date range for the longest streak
    let longestStreakDateRange = "Ei tietoja";
    if (streakData.longestGapStart && streakData.longestGapEnd) {
      const startDate = formatDate(streakData.longestGapStart);
      const endDate = formatDate(streakData.longestGapEnd);
      longestStreakDateRange = `${startDate} - ${endDate}`;
    }
    
    console.log('Main stats calculation:', {
      streaks: streakData.streaks,
      longestStreak: longestStreak,
      currentStreak: currentStreak,
      daysSincePrevious: daysSincePrevious,
      longestStreakDateRange: longestStreakDateRange
    });
    
    // Calculate monthly trend data for current year
    const currentYear = now.getFullYear();
    const trendData = calculateMonthlyTrends(records, currentYear);
    
    // Calculate previous year total
    const previousYearTotal = calculateYearTotal(records, currentYear - 1);
    
          return {
        newestReclamation: {
          date: formatDate(newestReclamation.date),
          product: newestReclamation.product,
          customer: newestReclamation.customer,
          reason: newestReclamation.reason
        },
        daysSincePrevious,
        longestStreak,
        currentStreak,
        longestStreakDateRange,
        trendData,
        previousYearTotal
      };
    } catch (error) {
      console.error('Error in calculateStatsFromRecords:', error);
      throw new Error(`Failed to calculate stats: ${error.message}`);
    }
  };

  // Calculate streaks of days without reclamations
  const calculateStreaks = (records) => {
    if (!records || records.length === 0) return [0];
    
    // Sort records by date (oldest first) for proper chronological analysis
    const sortedRecords = records.sort((a, b) => new Date(a.date) - new Date(b.date));
    const streaks = [];
    
    // Calculate current streak (from newest reclamation to now)
    const now = new Date();
    const newestDate = new Date(sortedRecords[sortedRecords.length - 1].date); // Last record is newest
    const currentStreak = Math.floor((now - newestDate) / (1000 * 60 * 60 * 24));
    
    console.log('Streak calculation debug:', {
      now: now.toISOString(),
      newestDate: newestDate.toISOString(),
      currentStreak: currentStreak,
      totalRecords: sortedRecords.length
    });
    
    // Find the longest gap between any two consecutive reclamations
    let longestGap = 0;
    let longestGapStart = null;
    let longestGapEnd = null;
    
    for (let i = 0; i < sortedRecords.length - 1; i++) {
      const currentDate = new Date(sortedRecords[i].date);
      const nextDate = new Date(sortedRecords[i + 1].date);
      const daysBetween = Math.floor((nextDate - currentDate) / (1000 * 60 * 60 * 24));
      
      console.log(`Gap ${i}: ${daysBetween} days between ${currentDate.toISOString()} and ${nextDate.toISOString()}`);
      
      if (daysBetween > longestGap) {
        longestGap = daysBetween;
        longestGapStart = currentDate;
        longestGapEnd = nextDate;
      }
    }
    
    // Log the longest gap found
    if (longestGap > 0) {
      console.log(`Longest gap found: ${longestGap} days between ${longestGapStart?.toISOString()} and ${longestGapEnd?.toISOString()}`);
    }
    
    // Add the longest gap as the main streak
    if (longestGap > 0) {
      streaks.push(longestGap);
    }
    
    // Add current streak
    streaks.push(currentStreak);
    
    // Sort by descending order
    const finalStreaks = streaks.sort((a, b) => b - a);
    console.log('Final streaks array:', finalStreaks);
    
    // Return both the streaks and the longest gap date range
    return {
      streaks: finalStreaks,
      longestGap: longestGap,
      longestGapStart: longestGapStart,
      longestGapEnd: longestGapEnd
    };
  };

  // Calculate monthly trends for a specific year
  const calculateMonthlyTrends = (records, year) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = monthNames.map(month => ({ month, reclamations: 0 }));
    
    records.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate.getFullYear() === year) {
        const monthIndex = recordDate.getMonth();
        monthlyData[monthIndex].reclamations++;
      }
    });
    
    return monthlyData;
  };

  // Calculate total reclamations for a specific year
  const calculateYearTotal = (records, year) => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year;
    }).length;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) return <div className="dashboard-container"><div className="loading">{translations.loading}</div></div>;
  if (error) return <div className="dashboard-container"><div className="error">{translations.error} {error}</div></div>;

  // Calculate progress bar percentage using daysSincePrevious vs longest streak
  let currentStreakPercentage = 0;
  if (stats.longestStreak > 0) {
    // Use daysSincePrevious instead of currentStreak for the progress bar
    const actualCurrentDays = stats.daysSincePrevious || 0;
    if (actualCurrentDays >= stats.longestStreak) {
      // If current days equals or exceeds the record, show 100%
      currentStreakPercentage = 100;
    } else {
      // Otherwise show the actual percentage
      currentStreakPercentage = (actualCurrentDays / stats.longestStreak) * 100;
    }
  }
  const streakDiff = stats.longestStreak - (stats.daysSincePrevious || 0);
  
  // Debug logging to see what values we're working with
  console.log('Progress Bar Debug:', {
    daysSincePrevious: stats.daysSincePrevious,
    longestStreak: stats.longestStreak,
    currentStreakPercentage: currentStreakPercentage,
    streakDiff: streakDiff,
    expectedWidth: `${Math.round(currentStreakPercentage)}%`
  });
  
  console.log('Progress bar width will be:', Math.round(currentStreakPercentage) + '%');

  // Message design system based on days without reclamations
  const days = stats.daysSincePrevious || 0;
  let messageClass = "tier-10";
  let messageIconSvg = null;
  let messageTitle = "";
  let messageSub = "";
  
  if (days < 10) {
    messageClass = "tier-0";
    messageTitle = translations.under10Days;
    messageSub   = translations.under10DaysSub;
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M109-120q-11 0-20-5.5T75-140q-5-9-5.5-19.5T75-180l370-640q6-10 15.5-15t19.5-5q10 0 19.5 5t15.5 15l370 640q6 10 5.5 20.5T885-140q-5 9-14 14.5t-20 5.5H109Zm69-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm0-120q17 0 28.5-11.5T520-400v-120q0-17-11.5-28.5T480-560q-17 0-28.5 11.5T440-520v120q0 17 11.5 28.5T480-360Zm0-100Z"/>
      </svg>
    );
  } else if (days < 20) {
    messageClass = "tier-10";
    messageTitle = translations.days10Plus;
    messageSub   = translations.days10PlusSub;
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M840-640q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14H280v-520l240-238q15-15 35.5-17.5T595-888q19 10 28 28t4 37l-45 183h258Zm-480 34v406h360l120-280v-80H480l54-220-174 174ZM160-120q-33 0-56.5-23.5T80-200v-360q0-33 23.5-56.5T160-640h120v80H160v360h120v80H160Zm200-80v-406 406Z"/>
      </svg>
    );
  } else if (days < 30) {
    messageClass = "tier-20";
    messageTitle = translations.days20Plus;
    messageSub   = translations.days20PlusSub;
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M480-260q53 0 100.5-23t76.5-67q11-17 3-33.5T634-400q-8 0-14.5 3.5T609-386q-23 31-57 48.5T480-320q-38 0-72-17.5T351-386q-5-7-11.5-10.5T325-400q-18 0-26 16t3 32q29 45 76.5 68.5T480-260Zm140-260q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/>
      </svg>
    );
  } else if (days < 60) {
    messageClass = "tier-30";
    messageTitle = translations.days30Plus;
    messageSub   = translations.days30PlusSub;
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143Zm126 18L314-169q-11 7-23 6t-21-8q-9-7-14-17.5t-2-23.5l44-189-147-127q-10-9-12.5-20.5T140-571q4-11 12-18t22-9l194-17 75-178q5-12 15.5-18t21.5-6q11 0 21.5 6t15.5 18l75 178 194 17q14 2 22 9t12 18q4 11 1.5 22.5T809-528L662-401l44 189q3 13-2 23.5T690-171q-9 7-21 8t-23-6L480-269Zm0-201Z"/>
      </svg>
    );
  } else if (days < 90) {
    messageClass = "tier-60";
    messageTitle = translations.days60Plus;
    messageSub   = translations.days60PlusSub;
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M440-200v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80q0-33 23.5-56.5T360-840h240q33 0 56.5 23.5T680-760h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h120q17 0 28.5 11.5T680-160q0 17-11.5 28.5T640-120H320q-17 0-28.5-11.5T280-160q0-17 11.5-28.5T320-200h120ZM280-528v-152h-80v40q0 38 22 68.5t58 43.5Zm200 128q50 0 85-35t35-85v-240H360v240q0 50 35 85t85 35Zm200-128q36-13 58-43.5t22-68.5v-40h-80v152Zm-200-52Z"/>
      </svg>
    );
  } else if (days < 120) {
    messageClass = "tier-90";
    messageTitle = translations.days90Plus;
    messageSub   = translations.days90PlusSub;
    messageIconSvg = (
      <svg className="message-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden>
        <path fill="currentColor" d="M480-165q-17 0-33-7.5T419-194L113-560q-9-11-13.5-24T95-611q0-9 1.5-18.5T103-647l75-149q11-20 29.5-32t41.5-12h462q23 0 41.5 12t29.5 32l75 149q5 8 6.5 17.5T865-611q0 14-4.5 27T847-560L541-194q-12 14-28 21.5t-33 7.5Zm-95-475h190l-60-120h-70l-60 120Zm55 347v-267H218l222 267Zm80 0 222-267H520v267Zm144-347h106l-60-120H604l60 120Zm-474 0h106l60-120H250l-60 120Z"/>
      </svg>
    );
  } else {
    messageClass = "tier-120";
    messageTitle = translations.days120Plus;
    messageSub   = translations.days120PlusSub;
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
  const monthCaption = trendPercent === 0 ? translations.noChangeFromLastMonth : (trendPercent > 0 ? translations.increaseFromLastMonth : translations.decreaseFromLastMonth);

  // Year totals and YoY percentage
  const yearTotal = stats.trendData.reduce((sum, m) => sum + m.reclamations, 0);
  const prevYearTotal = stats.previousYearTotal || 0;
  const rawYearChange = prevYearTotal === 0 ? (yearTotal === 0 ? 0 : 100) : ((yearTotal - prevYearTotal) / prevYearTotal) * 100;
  const yearPercent = Math.round(rawYearChange);
  const yearDeltaClass = yearPercent > 0 ? 'delta-positive' : (yearPercent < 0 ? 'delta-negative' : 'delta-neutral');
  const yearCaption = yearPercent === 0 ? translations.noChangeFromLastYear : (yearPercent > 0 ? translations.increaseFromLastYear : translations.decreaseFromLastYear);

  const todayStr = new Date().toLocaleDateString('fi-FI', {
    day: 'numeric', month: 'numeric', year: 'numeric'
  });

  // Shorten newest reclamation reason to just a keyword before a dash
  const shortReason = (stats.newestReclamation.reason || '').split('-')[0].trim() || stats.newestReclamation.reason;

  return (
    <div className="dashboard-container">
  <div className="page-shell">
    <header className="top-bar">
      <div className="topbar-left">
        <span className="topbar-title">{translations.pageTitle}</span>
      </div>
      <div className="topbar-right">
        <span className="material-symbols-rounded topbar-cal" aria-hidden>calendar_month</span>
        <span className="topbar-date">{todayStr}</span>
      </div>
    </header>
  

    <div className="dashboard-grid">
        <div className="top-row">
          <div className="top-left">
            {/* Top-Left Card: Newest reclamation */}
            <div className="dashboard-card">
              <h2 className="card-title">{translations.newestReclamation}</h2>
              <div className="card-content">
                <div className="date-display">
                  <span className="material-symbols-rounded" aria-hidden>calendar_month</span>
                  <span className="date-text">{stats.newestReclamation.date}</span>
                </div>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">{translations.product}</span>
                    <span className="detail-value">{stats.newestReclamation.product}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{translations.customer}</span>
                    <span className="detail-value">{stats.newestReclamation.customer}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{translations.reason}</span>
                    <span className="detail-value">{shortReason}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="top-right">
            {/* Top-Right Card: Days since previous reclamation */}
            <div className="dashboard-card">
              <h2 className="card-title">{translations.daysSincePrevious}</h2>
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
                        x="Aug" 
                        stroke="#F95A10" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        label={{ value: "Edellinen reklamaatio", position: 'insideTopLeft', fill: '#F95A10', fontSize: 11 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className={`message-bubble ${messageClass} no-border`}>
                  <div className="bubble-icon">{messageIconSvg}</div>
                  <div className="bubble-text">
                    <div className="message-title">{messageTitle}</div>
                    <div className="message-sub">{messageSub}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: 3 equal cards */}
<div className="bottom-row">

{/* Bottom-Left Card: Reclamations this year */}
<div className="dashboard-card">
  <h2 className="card-title">{translations.reclamationsThisYear}</h2>
  <div className="card-content">
    <div className="count-display">
      <span className="material-symbols-rounded" aria-hidden>warning</span>
      <span className="count-number">{yearTotal}</span>
    </div>

    <div className="trend-block">
      <span className={`trend-delta ${yearDeltaClass}`}>
        {yearPercent > 0 ? `+${yearPercent}%` : `${yearPercent}%`}
      </span>
      <div className="trend-caption">{yearCaption}</div>
    </div>
  </div>
</div>

{/* Middle Bottom Card: Reclamations this month */}
<div className="dashboard-card">
  <h2 className="card-title">{translations.reclamationsThisMonth}</h2>
  <div className="card-content">
    <div className="count-display">
      <span className="material-symbols-rounded" aria-hidden>warning</span>
      <span className="count-number">{currVal}</span>
    </div>

    <div className="trend-block">
      <span className={`trend-delta ${trendDeltaClass}`}>
        {trendPercent > 0 ? `+${trendPercent}%` : `${trendPercent}%`}
      </span>
      <div className="trend-caption">{monthCaption}</div>
    </div>
  </div>
</div>


          {/* Bottom-Right Card: Longest streak without reclamations */}
          <div className="dashboard-card">
            <h2 className="card-title">{translations.longestStreak}</h2>
            <div className="card-content">
              <div className="count-display longest-streak">
                <div className="icon-number-row">
                  <span className="material-symbols-rounded" aria-hidden>calendar_month</span>
                  <span className="count-number">{stats.longestStreak}</span>
                </div>
                <div className="streak-date-range">
                  <span className="streak-date-text">{stats.longestStreakDateRange}</span>
                </div>
              </div>
              <div className="progress-section">
                <div className="progress-item">
                  <div className="progress-label">{translations.currentStreakVsRecord}</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill current-streak" 
                      style={{ width: `${Math.min(currentStreakPercentage, 100)}%` }}
                    ></div>
                  </div>
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