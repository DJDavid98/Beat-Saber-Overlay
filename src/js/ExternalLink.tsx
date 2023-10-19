import { FC, PropsWithChildren } from 'react';

export const ExternalLink: FC<PropsWithChildren<{ href: string }>> = ({ href, children }) =>
    <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>;
