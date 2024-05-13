export default function Point({ pieces, onDrop, position }) {

    const onDragStart = (event) => event.dataTransfer.setData('text', position);
    const onDragOver = (event) => { event.preventDefault(); }
    const onDropListener = (event) => {
        event.preventDefault();
        var data = event.dataTransfer.getData("text");
        event.target.appendChild(document.getElementById(data));
    }

    const Pieces = Array.from({ length: Math.abs(pieces) });
    const color = pieces > 0 ? 'white' : 'black';

    return <div className="point" onDragOver={onDragOver} onDragStart={onDragStart} onDrop={onDropListener}>
        {Pieces.map((value, index) => <div className={`piece ${color}`} key={index} />)}
    </div>
}