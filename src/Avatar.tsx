import { UserData } from './Types';
import './Avatar.css';

export type AvatarProps = {
    user?: UserData;
    onClick?: () => void;
}

export default function Avatar({ user, onClick }: AvatarProps) {
    return user
        ? <img className="avatar" onClick={onClick} src={user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`} alt={user.name} />
        : <img className="avatar" onClick={onClick} src="https://i.pravatar.cc/100" />
}