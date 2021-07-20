import {SyncedSerialize, PublishServer} from '../SyncedSerialize.js'
import * as assert from "assert"
import * as sinon from "sinon"

afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('SyncedSerializeStatic', () => {
    describe('GetNetworkID', () => {
        it('should increment the network ID each time it is called', () => {
            class TestClass extends SyncedSerialize {}
            let test1 = new TestClass(null);
            let test2 = new TestClass(null);

            assert.strictEqual(test1.networkID, 1);
            assert.strictEqual(test2.networkID, 2);
        });
    });
});

describe('SyncedSerialize', () => {
    describe('constructor', () => {
        it('should create the class with a server', () => {
            class TestClass extends SyncedSerialize {}

            let server = sinon.createStubInstance(PublishServer);
            let test = new TestClass(server as unknown as PublishServer);

            assert.strictEqual(test.server, server);
        });
    });

    describe('serialize', () => {
        it('should throw an error if the server isn\'t running',() => {
            class TestClass extends SyncedSerialize {}

            let server = {
                listening: false
            };
            let test = new TestClass(server as unknown as PublishServer);

            assert.throws(() => {
                test.serialize('','');
            });
        });
        it('should call the publish function if the server is running', () => {
            class TestClass extends SyncedSerialize {}

            let server = {
                listening: true,
                publish: () => {}
            }

            let stub = sinon.stub(server, "publish").callsFake((...args) => {});

            let test = new TestClass(server as unknown as PublishServer);

            test.serialize('', '');

            sinon.assert.calledOnce(stub);
        });
        it('should send network id and other properties', () => {
            class TestClass extends SyncedSerialize {
                test : number = 0;
            }

            let server = {
                listening: true,
                publish: () => {}
            }

            let stub = sinon.stub(server, "publish").callsFake((...args) => {
                let json = JSON.parse(args.pop())
                assert.strictEqual(typeof json.networkID, "number");
                if(json.test !== undefined) {
                    assert.strictEqual(typeof json.test, "number");
                }
            });

            let test = new TestClass(server as unknown as PublishServer);

            test.serialize('', '');

            sinon.assert.callCount(stub, 2);
        });
    })
});

describe('PublishServer', () => {
    describe('publish', () => {
        it('should ')
    });
});