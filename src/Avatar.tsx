import { UserData } from './Types';
import './Avatar.css';

export type AvatarProps = {
    user?: UserData;
    onClick?: () => void;
}

export default function Avatar({ user, onClick }: AvatarProps) {
    return <img className="avatar" onClick={onClick} src={user ? user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}` : 'https://i.pravatar.cc/100'} alt={user?.name} />
}