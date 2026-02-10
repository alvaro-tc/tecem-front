
import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

// project imports
import MinimalLayout from './../layout/MinimalLayout';
import Loadable from '../ui-component/Loadable';

// landing routing
const LandingPage = Loadable(lazy(() => import('../views/pages/landing/LandingPage')));
const PublicCourses = Loadable(lazy(() => import('../views/pages/landing/PublicCourses')));
const AboutPage = Loadable(lazy(() => import('../views/pages/landing/AboutPage')));
const PublicPublications = Loadable(lazy(() => import('../views/pages/landing/PublicPublications')));
const PublicProjects = Loadable(lazy(() => import('../views/pages/landing/PublicProjects')));
const StudentCourseRegistration = Loadable(lazy(() => import('../views/pages/school/StudentCourseRegistration')));
const StudentProjectRegistration = Loadable(lazy(() => import('../views/pages/school/StudentProjectRegistration')));

//-----------------------|| LANDING ROUTING ||-----------------------//

const LandingRoutes = () => {
    const location = useLocation();

    return (
        <Route path={['/', '/courses', '/about', '/publications', '/projects', '/extras/course-registration', '/project-registration']}>
            <MinimalLayout>
                <Switch location={location} key={location.pathname}>
                    <Route exact path="/" component={LandingPage} />
                    <Route path="/courses" component={PublicCourses} />
                    <Route path="/about" component={AboutPage} />
                    <Route path="/publications" component={PublicPublications} />
                    <Route path="/projects" component={PublicProjects} />
                    <Route path="/extras/course-registration" component={StudentCourseRegistration} />
                    <Route path="/project-registration" component={StudentProjectRegistration} />
                </Switch>
            </MinimalLayout>
        </Route>
    );
};

export default LandingRoutes;
