
export function mapReportForAdminDisplay(reportData, surveyQuestions = []) {
  if (!reportData || !reportData.answers) {
    return { 
      sections: [], 
      summary: { total: 0, answered: 0, completionRate: 0 } 
    };
  }

  let answers = reportData.answers;
  if (typeof answers === 'string') {
    try {
      answers = JSON.parse(answers);
    } catch (e) {
      console.error("Erreur parsing JSON answers:", e);
      return { sections: [], summary: { total: 0, answered: 0, completionRate: 0 } };
    }
  }
  const questionsMap = {};
  surveyQuestions.forEach(q => {
    questionsMap[q.type] = q;
  });

  // Mapper chaque réponse
  const sections = answers.map((answer, index) => {
    const relatedQuestion = questionsMap[answer.type] || {};
    
    return {
      id: index + 1,
      questionType: answer.type,
      questionText: relatedQuestion.text || `Question ${answer.type}`,
      response: formatResponseForDisplay(answer, relatedQuestion),
      isRequired: relatedQuestion.is_required || false,
      rawValue: answer.value
    };
  });

  const summary = {
    total: surveyQuestions.length,
    answered: sections.length,
    completionRate: surveyQuestions.length > 0 ? 
      Math.round((sections.length / surveyQuestions.length) * 100) : 0,
    submittedAt: reportData.submitted_at,
    status: reportData.status,
    missionTitle: reportData.mission_title || '',
    userName: reportData.user_name || reportData.user_email || 'Utilisateur inconnu'
  };

  return { sections, summary };
}


function formatResponseForDisplay(answer, question = {}) {
  const baseResponse = {
    displayValue: '',
    color: 'blue',
    icon: '📝',
    badge: answer.type,
    context: ''
  };

  switch (answer.type) {
    case 'text':
      return {
        ...baseResponse,
        displayValue: answer.value,
        icon: '📝',
        color: 'blue',
        preview: answer.value.length > 50 ? 
          answer.value.substring(0, 50) + '...' : answer.value
      };
      
    case 'rating':
      const rating = parseInt(answer.value);
      const maxRating = question.max_rating || 5;
      return {
        ...baseResponse,
        displayValue: `${answer.value}/${maxRating}`,
        icon: '⭐',
        color: rating >= 4 ? 'green' : rating >= 3 ? 'yellow' : 'red',
        stars: '★'.repeat(rating) + '☆'.repeat(maxRating - rating),
        context: `${question.min_label || 'Min'} → ${question.max_label || 'Max'}`
      };
      
    case 'multiple_choice':
      return {
        ...baseResponse,
        displayValue: answer.value,
        icon: '✅',
        color: 'green',
        context: question.options ? 
          `Choix parmi: ${question.options.map(o => o.text).join(', ')}` : ''
      };
      case 'checkboxes':
  let selectedOptions = [];
  
  if (Array.isArray(answer.value)) {
    selectedOptions = answer.value
      .map((isSelected, index) => {
        if (isSelected === true && question.options && question.options[index]) {
          return question.options[index].text;
        }
        return null;
      })
      .filter(Boolean);
  }

  return {
    ...baseResponse,
    displayValue: selectedOptions.length > 0 ? selectedOptions.join(', ') : 'Aucune option sélectionnée',
    icon: '☑️',
    color: 'purple',
    count: selectedOptions.length,
    context: question.options ? 
      `Options disponibles: ${question.options.map(o => o.text).join(', ')}` : ''
  };
    case 'image_upload':
      const images = Array.isArray(answer.value) ? answer.value : [answer.value];
      return {
        ...baseResponse,
        displayValue: `${images.length} image(s)`,
        icon: '🖼️',
        color: 'indigo',
        images: images,
        context: `${images.length} fichier(s) téléchargé(s)`
      };
      
    case 'gps_capture':
      if (typeof answer.value === 'object' && answer.value.lat && answer.value.lng) {
        return {
          ...baseResponse,
          displayValue: `Lat: ${answer.value.lat.toFixed(4)}, Lng: ${answer.value.lng.toFixed(4)}`,
          icon: '📍',
          color: 'teal',
          coordinates: answer.value,
          mapUrl: `https://maps.google.com/?q=${answer.value.lat},${answer.value.lng}`
        };
      }
      return {
        ...baseResponse,
        displayValue: 'Coordonnées invalides',
        icon: '📍',
        color: 'red'
      };
      
    case 'audio_recording':
      return {
        ...baseResponse,
        displayValue: 'Enregistrement audio',
        icon: '🎵',
        color: 'orange',
        audioUrl: answer.value,
        context: 'Fichier audio disponible'
      };

    case 'date':
      return {
        ...baseResponse,
        displayValue: answer.value ? String(answer.value) : 'Non renseignée',
        icon: '📅',
        color: 'blue',
        context: 'Date observée'
      };

    case 'time':
      return {
        ...baseResponse,
        displayValue: answer.value ? String(answer.value) : 'Non renseignée',
        icon: '⏰',
        color: 'blue',
        context: 'Heure observée'
      };

    case 'yes_no': {
      const isYes = String(answer.value).toLowerCase() === 'oui' || answer.value === true || String(answer.value).toLowerCase() === 'yes';
      return {
        ...baseResponse,
        displayValue: isYes ? 'Oui' : 'Non',
        icon: isYes ? '✅' : '❌',
        color: isYes ? 'green' : 'red',
        context: isYes ? 'Conforme / Positif' : 'Non conforme / Négatif'
      };
    }

    case 'number':
      return {
        ...baseResponse,
        displayValue: answer.value !== undefined && answer.value !== null ? String(answer.value) : '0',
        icon: '🔢',
        color: 'emerald',
        context: 'Valeur numérique'
      };
      
    default:
      return {
        ...baseResponse,
        displayValue: String(answer.value),
        icon: '❓',
        color: 'gray',
        context: `Type: ${answer.type}`
      };
  }
}


export function generateReportStatistics(reports) {
  if (!Array.isArray(reports) || reports.length === 0) {
    return {
      total: 0,
      byStatus: {},
      byMission: {},
      recent: []
    };
  }

  const stats = {
    total: reports.length,
    byStatus: {},
    byMission: {},
    recent: reports.slice(0, 5) 
  };

  reports.forEach(report => {
    const status = report.status || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
  });

  reports.forEach(report => {
    const missionTitle = report.mission_title || `Mission ${report.mission_id}`;
    stats.byMission[missionTitle] = (stats.byMission[missionTitle] || 0) + 1;
  });

  return stats;
}


export function filterAndSortReports(reports, filters = {}) {
  if (!Array.isArray(reports)) return [];

  let filteredReports = [...reports];

  if (filters.status && filters.status !== 'all') {
    filteredReports = filteredReports.filter(r => r.status === filters.status);
  }

  if (filters.missionId) {
    filteredReports = filteredReports.filter(r => r.mission_id === parseInt(filters.missionId));
  }

  if (filters.userId) {
    filteredReports = filteredReports.filter(r => r.user_id === parseInt(filters.userId));
  }

  if (filters.dateFrom) {
    filteredReports = filteredReports.filter(r => 
      new Date(r.submitted_at) >= new Date(filters.dateFrom)
    );
  }

  if (filters.dateTo) {
    filteredReports = filteredReports.filter(r => 
      new Date(r.submitted_at) <= new Date(filters.dateTo)
    );
  }

  // Tri
  const sortBy = filters.sortBy || 'submitted_at';
  const sortOrder = filters.sortOrder || 'desc';

  filteredReports.sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];

    if (sortBy === 'submitted_at') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  return filteredReports;
}