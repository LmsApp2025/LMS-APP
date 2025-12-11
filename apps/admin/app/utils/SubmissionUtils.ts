// In: apps/admin/app/utils/SubmissionUtils.ts (FINAL VERSION)

export const groupAssignmentSubmissions = (submissions: any[], allCourses: any[]) => {
  if (!submissions || !allCourses) return {};
  return submissions.reduce((acc, sub) => {
    if (!sub.userId) return acc;
    const course = allCourses.find(c => c._id.toString() === sub.courseId.toString());
    if (!course) return acc;
    const userId = sub.userId._id;
    if (!acc[userId]) acc[userId] = { userName: sub.userId.name, username: sub.userId.username, courses: {} };
    if (!acc[userId].courses[course._id]) acc[userId].courses[course._id] = { courseName: course.name, moduleAssignments: [], finalAssignments: [] };
    
    let assignmentTitle = "Unknown Assignment";
    let isFinal = true;
    for (const module of (course.modules || [])) {
      const found = (module.assignments || []).find((a: any) => a.assignmentId.toString() === sub.assignmentId.toString());
      if (found) { assignmentTitle = found.title; isFinal = false; break; }
    }
    if (isFinal) {
      const found = (course.finalAssignments || []).find((a: any) => a.assignmentId.toString() === sub.assignmentId.toString());
      if (found) assignmentTitle = found.title;
    }
    const submissionData = { ...sub, title: assignmentTitle, link: sub.content.url };
    if (isFinal) acc[userId].courses[course._id].finalAssignments.push(submissionData);
    else acc[userId].courses[course._id].moduleAssignments.push(submissionData);
    return acc;
  }, {});
};

export const findQuizContext = (course: any, quizId: string) => {
    if (!course || !quizId) return null;
    const allQuizzes = [
        ...(course.finalQuizzes || []),
        ...course.modules.flatMap((m: any) => m.quizzes || []),
        ...course.modules.flatMap((m: any) => m.lessons.flatMap((l: any) => l.quizzes || [])),
    ];
    const foundQuiz = allQuizzes.find((q: any) => q.quizId.toString() === quizId.toString());
    if (foundQuiz) {
        let moduleTitle = "Final Quiz";
        let lessonTitle = null;
        for (const module of course.modules || []) {
            if ((module.quizzes || []).some((q: any) => q.quizId.toString() === quizId.toString())) { moduleTitle = module.title; break; }
            for (const lesson of module.lessons || []) {
                if ((lesson.quizzes || []).some((q: any) => q.quizId.toString() === quizId.toString())) { moduleTitle = module.title; lessonTitle = lesson.title; break; }
            }
        }
        return { courseName: course.name, moduleTitle, lessonTitle, quiz: foundQuiz };
    }
    return null;
};

export const groupQuizSubmissions = (submissions: any[], allCourses: any[]) => {
    if (!submissions || !allCourses) return {};
    return submissions.reduce((acc: any, sub: any) => {
       if (!sub.userId) return acc;
        const course = allCourses.find((c: any) => c._id.toString() === sub.courseId.toString());
        if (!course) return acc;
        const context = findQuizContext(course, sub.quizId);
        if (!context || !context.quiz) return acc;
        const userId = sub.userId._id;
        if (!acc[userId]) acc[userId] = { userName: sub.userId.name, username: sub.userId.username, courses: {} };
        if (!acc[userId].courses[course._id]) acc[userId].courses[course._id] = { courseName: course.name, modules: {}, finalQuizzes: [] };
        const submissionData = { ...sub, quizTitle: context.quiz.title };
        if (context.moduleTitle === 'Final Quiz') { acc[userId].courses[course._id].finalQuizzes.push(submissionData); }
        else {
            const moduleId = context.moduleTitle;
            if (!acc[userId].courses[course._id].modules[moduleId]) acc[userId].courses[course._id].modules[moduleId] = { moduleTitle: moduleId, lessonQuizzes: {}, moduleQuizzes: [] };
            if (context.lessonTitle) {
                const lessonId = context.lessonTitle;
                if (!acc[userId].courses[course._id].modules[moduleId].lessonQuizzes[lessonId]) acc[userId].courses[course._id].modules[moduleId].lessonQuizzes[lessonId] = { lessonTitle: lessonId, quizzes: [] };
                acc[userId].courses[course._id].modules[moduleId].lessonQuizzes[lessonId].quizzes.push(submissionData);
            } else { acc[userId].courses[course._id].modules[moduleId].moduleQuizzes.push(submissionData); }
        }
        return acc;
    }, {});
};