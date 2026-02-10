import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

// project imports
import MainLayout from './../layout/MainLayout';
import Loadable from '../ui-component/Loadable';
import AuthGuard from './../utils/route-guard/AuthGuard';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('../views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('../views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('../views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('../views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('../views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('../views/utilities/TablerIcons')));

// school routing
// school routing
const Programs = Loadable(lazy(() => import('../views/pages/school/Programs')));
const Periods = Loadable(lazy(() => import('../views/pages/school/Periods')));
const Subjects = Loadable(lazy(() => import('../views/pages/school/Subjects')));
const CriteriaList = Loadable(lazy(() => import('../views/pages/school/CriteriaList')));
const Courses = Loadable(lazy(() => import('../views/pages/school/Courses')));
const Weightings = Loadable(lazy(() => import('../views/pages/school/Weightings')));
const Enrollments = Loadable(lazy(() => import('../views/pages/school/Enrollments')));
const Grades = Loadable(lazy(() => import('../views/pages/school/Grades')));
const TaskGrading = Loadable(lazy(() => import('../views/pages/school/TaskGrading')));
const Projects = Loadable(lazy(() => import('../views/pages/school/Projects')));
const StudentProjectRegistration = Loadable(lazy(() => import('../views/pages/school/StudentProjectRegistration')));
const StudentCourseRegistration = Loadable(lazy(() => import('../views/pages/school/StudentCourseRegistration')));

// extras routing
const Publications = Loadable(lazy(() => import('../views/pages/extras/Publications')));
const SocialMediaConfig = Loadable(lazy(() => import('../views/pages/extras/SocialMediaConfig')));
const LandingPageConfig = Loadable(lazy(() => import('../views/pages/extras/LandingPageConfig')));


// user management routing
const UsersStudents = Loadable(lazy(() => import('../views/pages/users/Students')));
const UsersTeachers = Loadable(lazy(() => import('../views/pages/users/Teachers')));

// account routing
const AccountSettings = Loadable(lazy(() => import('../views/pages/account/AccountSettings')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('../views/sample-page')));

//-----------------------|| MAIN ROUTING ||-----------------------//

const MainRoutes = () => {
    const location = useLocation();

    return (
        <Route
            path={[
                '/dashboard/default',

                '/utils/util-typography',
                '/utils/util-color',
                '/utils/util-shadow',
                '/icons/tabler-icons',
                '/icons/material-icons',

                '/icons/material-icons',

                '/school/programs',
                '/school/periods',
                '/school/subjects',
                '/school/criteria',
                '/school/courses',
                '/school/weightings',
                '/school/enrollments',
                '/school/grades',
                '/extras/task-grading',
                '/extras/projects',
                '/extras/publications',
                '/extras/social-media',
                '/extras/landing-config',
                '/users/students',
                '/users/teachers',
                '/account-settings',
            ]}
        >
            <MainLayout>
                <Switch location={location} key={location.pathname}>
                    <AuthGuard>
                        <Route path="/dashboard/default" component={DashboardDefault} />

                        <Route path="/utils/util-typography" component={UtilsTypography} />
                        <Route path="/utils/util-color" component={UtilsColor} />
                        <Route path="/utils/util-shadow" component={UtilsShadow} />
                        <Route path="/icons/tabler-icons" component={UtilsTablerIcons} />
                        <Route path="/icons/material-icons" component={UtilsMaterialIcons} />

                        <Route path="/school/programs" component={Programs} />
                        <Route path="/school/periods" component={Periods} />
                        <Route path="/school/subjects" component={Subjects} />
                        <Route path="/school/criteria" component={CriteriaList} />
                        <Route path="/school/courses" component={Courses} />
                        <Route path="/school/weightings" component={Weightings} />
                        <Route path="/school/enrollments" component={Enrollments} />
                        <Route path="/school/grades" component={Grades} />

                        <Route path="/extras/task-grading" component={TaskGrading} />
                        <Route path="/extras/projects" component={Projects} />
                        <Route path="/extras/publications" component={Publications} />
                        <Route path="/extras/social-media" component={SocialMediaConfig} />
                        <Route path="/extras/landing-config" component={LandingPageConfig} />

                        <Route path="/users/students" component={UsersStudents} />
                        <Route path="/users/teachers" component={UsersTeachers} />
                        <Route path="/account-settings" component={AccountSettings} />
                        <Route path="/sample-page" component={SamplePage} />
                    </AuthGuard>
                </Switch>
            </MainLayout>
        </Route>
    );
};

export default MainRoutes;
