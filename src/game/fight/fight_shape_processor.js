export default class FightShapeProcessor {
    static shapes = {
        "P": FightShapeProcessor.P_shape,
    }

    static buildShape(shapeId, size, cellId) {
        var shape = FightShapeProcessor.shapes[shapeId];
        if(shape) {
            var cells = shape(cellId, size)
            return cells;
        }
        else {
            return null;
        }
    }

    static P_shape(cellId) {
        return [cellId];
    }
}