import { IconFileText, IconShare } from '@tabler/icons';

const icons = {
    IconFileText,
    IconShare
};

export const portal = {
    id: 'portal',
    title: 'Portal',
    type: 'group',
    children: [
        {
            id: 'publications',
            title: 'Publicaciones',
            type: 'item',
            url: '/extras/publications',
            icon: icons.IconFileText,
            breadcrumbs: false
        },
        {
            id: 'social-media',
            title: 'Redes Sociales',
            type: 'item',
            url: '/extras/social-media',
            icon: icons.IconShare,
            breadcrumbs: false
        }
    ]
};
