export const cleanTemporaryIds = (data: any) => {
  if (Array.isArray(data)) { data.forEach(cleanTemporaryIds); } 
  else if (data && typeof data === 'object') {
    const idFields = ['_id', 'quizId', 'assignmentId'];
    idFields.forEach(field => {
        if (data[field] && !data[field].toString().match(/^[0-9a-fA-F]{24}$/)) delete data[field];
    });
    Object.keys(data).forEach(key => cleanTemporaryIds(data[key]));
  }
};