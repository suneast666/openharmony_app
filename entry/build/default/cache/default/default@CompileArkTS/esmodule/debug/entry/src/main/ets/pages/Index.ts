if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    diaries?: DiaryEntry[];
    searchText?: string;
    showSearch?: boolean;
}
import router from "@ohos:router";
// 日记数据模型
class DiaryEntry {
    id: string = '';
    title: string = '';
    content: string = '';
    date: string = '';
    time: string = '';
    mood: string = 'neutral';
    tags: string[] = [];
    constructor(title: string = '', content: string = '', mood: string = 'neutral', tags: string[] = []) {
        this.id = this.generateId();
        this.title = title;
        this.content = content;
        const now: Date = new Date();
        this.date = now.toISOString().split('T')[0];
        this.time = now.toTimeString().split(' ')[0].substring(0, 5);
        this.mood = mood;
        this.tags = tags;
    }
    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
}
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__diaries = this.createStorageLink('diaries', [], "diaries");
        this.__searchText = this.createStorageLink('searchText', '', "searchText");
        this.__showSearch = new ObservedPropertySimplePU(false, this, "showSearch");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.showSearch !== undefined) {
            this.showSearch = params.showSearch;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__diaries.purgeDependencyOnElmtId(rmElmtId);
        this.__searchText.purgeDependencyOnElmtId(rmElmtId);
        this.__showSearch.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__diaries.aboutToBeDeleted();
        this.__searchText.aboutToBeDeleted();
        this.__showSearch.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    // 使用 AppStorage 存储日记数据
    private __diaries: ObservedPropertyAbstractPU<DiaryEntry[]>;
    get diaries() {
        return this.__diaries.get();
    }
    set diaries(newValue: DiaryEntry[]) {
        this.__diaries.set(newValue);
    }
    private __searchText: ObservedPropertyAbstractPU<string>;
    get searchText() {
        return this.__searchText.get();
    }
    set searchText(newValue: string) {
        this.__searchText.set(newValue);
    }
    private __showSearch: ObservedPropertySimplePU<boolean>;
    get showSearch() {
        return this.__showSearch.get();
    }
    set showSearch(newValue: boolean) {
        this.__showSearch.set(newValue);
    }
    // 页面显示时初始化数据
    aboutToAppear() {
        // 初始化一些示例数据，如果AppStorage中没有数据
        if (AppStorage.get<DiaryEntry[]>('diaries') === undefined) {
            const sampleDiaries: DiaryEntry[] = [
                new DiaryEntry('美好的一天', '今天天气很好，心情也不错！', 'happy', ['开心', '天气']),
                new DiaryEntry('学习笔记', '今天学习了ArkTS的用法，收获很多', 'neutral', ['学习', '技术']),
                new DiaryEntry('美食日记', '尝试了一家新餐厅，味道很棒！', 'excited', ['美食', '探店'])
            ];
            AppStorage.setOrCreate<DiaryEntry[]>('diaries', sampleDiaries);
        }
    }
    // 搜索日记
    getFilteredDiaries(): DiaryEntry[] {
        if (!this.searchText.trim()) {
            return this.diaries;
        }
        const lowerKeyword: string = this.searchText.toLowerCase();
        return this.diaries.filter((diary: DiaryEntry) => {
            return diary.title.toLowerCase().includes(lowerKeyword) ||
                diary.content.toLowerCase().includes(lowerKeyword) ||
                diary.tags.some((tag: string) => tag.toLowerCase().includes(lowerKeyword));
        });
    }
    // 删除日记
    deleteDiary(id: string) {
        const newDiaries: DiaryEntry[] = this.diaries.filter((diary: DiaryEntry) => diary.id !== id);
        AppStorage.setOrCreate<DiaryEntry[]>('diaries', newDiaries);
    }
    // 渲染心情图标
    moodIcon(mood: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (mood === 'happy') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('😊');
                        Text.fontSize(24);
                        Text.width(30);
                        Text.height(30);
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
            else if (mood === 'sad') {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('😢');
                        Text.fontSize(24);
                        Text.width(30);
                        Text.height(30);
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
            else if (mood === 'excited') {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('😃');
                        Text.fontSize(24);
                        Text.width(30);
                        Text.height(30);
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
            else if (mood === 'angry') {
                this.ifElseBranchUpdateFunction(3, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('😠');
                        Text.fontSize(24);
                        Text.width(30);
                        Text.height(30);
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(4, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('😐');
                        Text.fontSize(24);
                        Text.width(30);
                        Text.height(30);
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
        }, If);
        If.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部标题栏
            Row.create();
            // 顶部标题栏
            Row.width('100%');
            // 顶部标题栏
            Row.height(60);
            // 顶部标题栏
            Row.backgroundColor('#FFFFFF');
            // 顶部标题栏
            Row.shadow({ radius: 4, color: '#DDDDDD' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('我的日记本');
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ left: 16 });
            Text.fontColor('#000000');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 搜索按钮
            Button.createWithLabel(this.showSearch ? '取消' : '搜索');
            // 搜索按钮
            Button.margin({ right: 16 });
            // 搜索按钮
            Button.fontSize(14);
            // 搜索按钮
            Button.backgroundColor(Color.Transparent);
            // 搜索按钮
            Button.fontColor('#007DFF');
            // 搜索按钮
            Button.onClick(() => {
                this.showSearch = !this.showSearch;
                if (!this.showSearch) {
                    this.searchText = '';
                }
            });
        }, Button);
        // 搜索按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 添加按钮
            Button.createWithLabel('+');
            // 添加按钮
            Button.margin({ right: 16 });
            // 添加按钮
            Button.fontSize(20);
            // 添加按钮
            Button.width(40);
            // 添加按钮
            Button.height(40);
            // 添加按钮
            Button.borderRadius(20);
            // 添加按钮
            Button.backgroundColor('#007DFF');
            // 添加按钮
            Button.fontColor(Color.White);
            // 添加按钮
            Button.onClick(() => {
                router.pushUrl({
                    url: 'pages/DiaryEdit',
                    params: { mode: 'add' }
                });
            });
        }, Button);
        // 添加按钮
        Button.pop();
        // 顶部标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 搜索栏
            if (this.showSearch) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: '搜索日记标题或内容...', text: this.searchText });
                        TextInput.width('90%');
                        TextInput.height(40);
                        TextInput.margin({ top: 10, bottom: 10 });
                        TextInput.backgroundColor(Color.White);
                        TextInput.border({ width: 1, color: '#DDDDDD' });
                        TextInput.borderRadius(8);
                        TextInput.padding({ left: 10, right: 10 });
                        TextInput.onChange((value: string) => {
                            this.searchText = value;
                        });
                    }, TextInput);
                });
            }
            // 日记列表 - 使用计算属性而不是本地变量
            // 获取过滤后的日记列表
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 日记列表 - 使用计算属性而不是本地变量
            // 获取过滤后的日记列表
            if (this.getFilteredDiaries().length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 10 });
                        List.layoutWeight(1);
                        List.margin({ top: 10 });
                        List.width('100%');
                        List.height('100%');
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const diary = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    itemCreation2(elmtId, isInitialRender);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                    ListItem.onClick(() => {
                                        router.pushUrl({
                                            url: 'pages/DiaryEdit',
                                            params: {
                                                mode: 'edit',
                                                diaryId: diary.id
                                            }
                                        });
                                    });
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.padding(15);
                                        Row.backgroundColor('#FFFFFF');
                                        Row.borderRadius(12);
                                        Row.shadow({ radius: 3, color: '#EEEEEE' });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // 心情图标
                                        Column.create();
                                        // 心情图标
                                        Column.margin({ right: 15 });
                                        // 心情图标
                                        Column.alignItems(HorizontalAlign.Center);
                                    }, Column);
                                    this.moodIcon.bind(this)(diary.mood);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(diary.time);
                                        Text.fontSize(12);
                                        Text.fontColor('#666666');
                                        Text.margin({ top: 4 });
                                    }, Text);
                                    Text.pop();
                                    // 心情图标
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // 日记内容摘要
                                        Column.create({ space: 4 });
                                        // 日记内容摘要
                                        Column.layoutWeight(1);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(diary.title || '无标题');
                                        Text.fontSize(16);
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Blank.create();
                                    }, Blank);
                                    Blank.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        // 标签
                                        if (diary.tags.length > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create({ space: 4 });
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    ForEach.create();
                                                    const forEachItemGenFunction = _item => {
                                                        const tag = _item;
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create(tag);
                                                            Text.fontSize(10);
                                                            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                                                            Text.backgroundColor('#E8F4FD');
                                                            Text.borderRadius(10);
                                                            Text.fontColor('#007DFF');
                                                        }, Text);
                                                        Text.pop();
                                                    };
                                                    this.forEachUpdateFunction(elmtId, diary.tags.slice(0, 2), forEachItemGenFunction);
                                                }, ForEach);
                                                ForEach.pop();
                                                Row.pop();
                                            });
                                        }
                                        else {
                                            this.ifElseBranchUpdateFunction(1, () => {
                                            });
                                        }
                                    }, If);
                                    If.pop();
                                    Row.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(diary.content.length > 100 ?
                                            diary.content.substring(0, 100) + '...' : diary.content);
                                        Text.fontSize(14);
                                        Text.fontColor('#666666');
                                        Text.maxLines(2);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(diary.date);
                                        Text.fontSize(12);
                                        Text.fontColor('#999999');
                                        Text.margin({ top: 4 });
                                    }, Text);
                                    Text.pop();
                                    // 日记内容摘要
                                    Column.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.getFilteredDiaries(), forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 空状态
                        Column.create();
                        // 空状态
                        Column.layoutWeight(1);
                        // 空状态
                        Column.justifyContent(FlexAlign.Center);
                        // 空状态
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('📝');
                        Text.fontSize(60);
                        Text.margin({ bottom: 20 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.searchText ? '没有找到相关日记' : '还没有日记，开始记录吧！');
                        Text.fontSize(16);
                        Text.fontColor('#666666');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (!this.searchText) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('写第一篇日记');
                                    Button.margin({ top: 20 });
                                    Button.backgroundColor('#007DFF');
                                    Button.fontColor(Color.White);
                                    Button.onClick(() => {
                                        router.pushUrl({
                                            url: 'pages/DiaryEdit',
                                            params: { mode: 'add' }
                                        });
                                    });
                                }, Button);
                                Button.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    // 空状态
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.dairy", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false" });
