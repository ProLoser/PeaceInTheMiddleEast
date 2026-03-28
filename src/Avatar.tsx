import { User } from './Types';
import './Avatar.css';

export type AvatarProps = {
    user?: User;
}

export default function Avatar({ user }: AvatarProps) {
    if (user?.photoURL) {
        return <img className="avatar"
          src={user.photoURL}
          alt={user.name}
          draggable={false} />
    }
    // const pravatarSrc = user ? `https://i.pravatar.cc/100?u=${user.uid}` : 'https://i.pravatar.cc/100';
    const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : '??';
    return <div className="avatar avatar-initials" aria-label={user?.name}>{initials}</div>
}