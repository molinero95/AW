
const tareas = require("../tareas");
const assert = require("assert");

const t1 = { text: "t1", done: true, tags: ["a1", "a2", "a3"] };
const t2 = { text: "t2", tags: ["a1", "a3"] };
const t3 = { text: "t3", done: false, tags: [] };
const t4 = { text: "t4", tags: ["a2", "a3"] };
const t5 = { text: "t5", done: true, tags: ["a5"] };

let list = [t1, t2, t3, t4];

describe("getToDoTasks", () => {
    it("Aplicado a la lista vacía", () => {
        assert.deepStrictEqual(tareas.getToDoTasks([]), []);
    }),

    it("Tarea con done: true", () => {
        assert.deepStrictEqual(tareas.getToDoTasks([t1]), []);
    });

    it("Tarea sin done", () => {
        assert.deepStrictEqual(tareas.getToDoTasks([t2]), ["t2"]);
    });

    it("Tarea con done: false", () => {
        assert.deepStrictEqual(tareas.getToDoTasks([t3]), ["t3"]);
    });

    it("Varias tareas", () => {
        assert.deepStrictEqual(tareas.getToDoTasks([t1, t2, t3]), ["t2", "t3"]);
    });
});

describe("findByTag", () => {
    it("Aplicado a la lista vacía", () => {
        assert.deepStrictEqual(tareas.findByTag([], "a1"), []);
    });
    
    it("Con el tag 'a1'", () => {
        assert.deepStrictEqual(tareas.findByTag(list, "a1"), [t1, t2]);
    });

    it("Con el tag 'a2'", () => {
        assert.deepStrictEqual(tareas.findByTag(list, "a2"), [t1, t4]);
    });

    it("Con el tag 'a3'", () => {
        assert.deepStrictEqual(tareas.findByTag(list, "a3"), [t1, t2, t4]);
    });

    it("Con el tag 'a4'", () => {
        assert.deepStrictEqual(tareas.findByTag(list, "a4"), []);
    });

    it("Con el tag vacío", () => {
        assert.deepStrictEqual(tareas.findByTag(list, ""), []);
    });
});

describe("findByTags", () => {
    it("Aplicado a la lista vacía", () => {
        assert.deepStrictEqual(tareas.findByTags([], "a1"), []);
    });
    
    it("Aplicado a la lista de tags vacía", () => {
        assert.deepStrictEqual(tareas.findByTags(list, []), []);
    });

    it("Con el tag 'a1'", () => {
        assert.deepStrictEqual(tareas.findByTags(list, ["a1"]), [t1, t2]);
    });

    it("Con el tag 'a2'", () => {
        assert.deepStrictEqual(tareas.findByTags(list, ["a2"]), [t1, t4]);
    });

    it("Con el tag 'a3'", () => {
        assert.deepStrictEqual(tareas.findByTags(list, ["a3"]), [t1, t2, t4]);
    });

    it("Con el tag 'a4'", () => {
        assert.deepStrictEqual(tareas.findByTags(list, ["a4"]), []);
    });

    it("Con los tags 'a1' y 'a2'", () => {
        assert.deepStrictEqual(tareas.findByTags([...list, t5], ["a1", "a2"]), [t1, t2, t4]);
    });
});

describe("countDone", () => {
    it("Aplicado a la lista vacía", () => {
        assert.strictEqual(tareas.countDone([]), 0);
    });

    it("Aplicado a un elemento con done: true", () => {
        assert.strictEqual(tareas.countDone([t1]), 1);
    });

    it("Aplicado a un elemento con done: false", () => {
        assert.strictEqual(tareas.countDone([t3]), 0);
    });

    it("Aplicado a un elemento sin done", () => {
        assert.strictEqual(tareas.countDone([t2]), 0);
    });

    it("Mezcla de elementos", () => {
        assert.strictEqual(tareas.countDone([t1, t2, t3]), 1);
    });

    it("Mezcla de elementos y dos finalizadas", () => {
        assert.strictEqual(tareas.countDone([t1, t2, t3, t4, t5]), 2);
    });

    it("Todas finalizadas", () => {
        assert.strictEqual(tareas.countDone([t1, t5]), 2);        
    });
    
});

describe("createTask", () => {
    it("Tarea sin tags", () => {
        let t = tareas.createTask("Sin tags");
        assert.strictEqual(t.text, "Sin tags");
        assert.deepStrictEqual(t.tags, []);
    });

    it("Tarea vacía", () => {
        let t = tareas.createTask("");
        assert.strictEqual(t.text, "");
        assert.deepStrictEqual(t.tags, []);
    });

    it("Tarea sin tags pero con espacios sobrantes", () => {
        let t = tareas.createTask("Sin tags   ");
        assert.strictEqual(t.text, "Sin tags");
        assert.deepStrictEqual(t.tags, []);
    });

    it("Tarea con un tag", () => {
        let t = tareas.createTask("Con un tag @ok ");
        assert.strictEqual(t.text, "Con un tag");
        assert.deepStrictEqual(t.tags, ["ok"]);
    });

    it("Tarea con varios tags", () => {
        let t = tareas.createTask("Con dos tags @ok @venga");
        assert.strictEqual(t.text, "Con dos tags");
        assert.deepStrictEqual(t.tags, ["ok", "venga"]);
    });
});