import { useState } from 'react';
import { User } from './Types';
import './Avatar.css';

export type AvatarProps = {
    user?: User;
}

export default function Avatar({ user }: AvatarProps) {
    const [imgError, setImgError] = useState(false);
    if (user?.photoURL && !imgError) {
        return <img className="avatar"
          src={user.photoURL}
          alt={user.name}
          draggable={false}
          onError={() => setImgError(true)} />
    }
    // const pravatarSrc = user ? `https://i.pravatar.cc/100?u=${user.uid}` : 'https://i.pravatar.cc/100';
    const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : '??';
    return <div className="avatar avatar-initials" aria-label={user?.name}><span>{initials}</span></div>
}