if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DiaryEdit_Params {
    diaries?: DiaryEntry[];
    diary?: DiaryEntry;
    mode?: string;
    newTag?: string;
    showTagInput?: boolean;
    moods?: MoodOption[];
}
import router from "@ohos:router";
import prompt from "@ohos:promptAction";
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
// 定义心情选项类型
class MoodOption {
    value: string = '';
    label: string = '';
    constructor(value: string, label: string) {
        this.value = value;
        this.label = label;
    }
}
class DiaryEdit extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__diaries = this.createStorageLink('diaries', [], "diaries");
        this.__diary = new ObservedPropertyObjectPU(new DiaryEntry(), this, "diary");
        this.__mode = new ObservedPropertySimplePU('add', this, "mode");
        this.__newTag = new ObservedPropertySimplePU('', this, "newTag");
        this.__showTagInput = new ObservedPropertySimplePU(false, this, "showTagInput");
        this.moods = [
            new MoodOption('happy', '开心'),
            new MoodOption('sad', '难过'),
            new MoodOption('neutral', '平静'),
            new MoodOption('excited', '兴奋'),
            new MoodOption('angry', '生气')
        ];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DiaryEdit_Params) {
        if (params.diary !== undefined) {
            this.diary = params.diary;
        }
        if (params.mode !== undefined) {
            this.mode = params.mode;
        }
        if (params.newTag !== undefined) {
            this.newTag = params.newTag;
        }
        if (params.showTagInput !== undefined) {
            this.showTagInput = params.showTagInput;
        }
        if (params.moods !== undefined) {
            this.moods = params.moods;
        }
    }
    updateStateVars(params: DiaryEdit_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__diaries.purgeDependencyOnElmtId(rmElmtId);
        this.__diary.purgeDependencyOnElmtId(rmElmtId);
        this.__mode.purgeDependencyOnElmtId(rmElmtId);
        this.__newTag.purgeDependencyOnElmtId(rmElmtId);
        this.__showTagInput.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__diaries.aboutToBeDeleted();
        this.__diary.aboutToBeDeleted();
        this.__mode.aboutToBeDeleted();
        this.__newTag.aboutToBeDeleted();
        this.__showTagInput.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __diaries: ObservedPropertyAbstractPU<DiaryEntry[]>;
    get diaries() {
        return this.__diaries.get();
    }
    set diaries(newValue: DiaryEntry[]) {
        this.__diaries.set(newValue);
    }
    private __diary: ObservedPropertyObjectPU<DiaryEntry>;
    get diary() {
        return this.__diary.get();
    }
    set diary(newValue: DiaryEntry) {
        this.__diary.set(newValue);
    }
    private __mode: ObservedPropertySimplePU<string>;
    get mode() {
        return this.__mode.get();
    }
    set mode(newValue: string) {
        this.__mode.set(newValue);
    }
    private __newTag: ObservedPropertySimplePU<string>;
    get newTag() {
        return this.__newTag.get();
    }
    set newTag(newValue: string) {
        this.__newTag.set(newValue);
    }
    private __showTagInput: ObservedPropertySimplePU<boolean>;
    get showTagInput() {
        return this.__showTagInput.get();
    }
    set showTagInput(newValue: boolean) {
        this.__showTagInput.set(newValue);
    }
    // 心情选项 - 使用明确定义的类实例
    private moods: MoodOption[];
    aboutToAppear() {
        // 使用类型安全的参数获取方式
        const params = router.getParams() as Record<string, string>;
        if (params) {
            this.mode = params.mode || 'add';
            if (params.diaryId && this.mode === 'edit') {
                const foundDiary = this.diaries.find((d: DiaryEntry) => d.id === params.diaryId);
                if (foundDiary) {
                    // 创建副本以避免直接修改
                    const newDiary = new DiaryEntry();
                    // 手动复制属性，避免使用 Object.assign
                    newDiary.id = foundDiary.id;
                    newDiary.title = foundDiary.title;
                    newDiary.content = foundDiary.content;
                    newDiary.date = foundDiary.date;
                    newDiary.time = foundDiary.time;
                    newDiary.mood = foundDiary.mood;
                    newDiary.tags = [...foundDiary.tags]; // 使用扩展运算符创建副本
                    this.diary = newDiary;
                }
            }
        }
    }
    // 保存日记
    saveDiary() {
        if (!this.diary.title.trim() || !this.diary.content.trim()) {
            prompt.showToast({ message: '请填写标题和内容', duration: 2000 });
            return;
        }
        const newDiaries: DiaryEntry[] = [...this.diaries];
        if (this.mode === 'edit') {
            // 更新现有日记
            const index = newDiaries.findIndex((d: DiaryEntry) => d.id === this.diary.id);
            if (index >= 0) {
                const now: Date = new Date();
                this.diary.date = now.toISOString().split('T')[0];
                this.diary.time = now.toTimeString().split(' ')[0].substring(0, 5);
                newDiaries[index] = this.diary;
            }
        }
        else {
            // 添加新日记
            const newDiary = new DiaryEntry(this.diary.title, this.diary.content, this.diary.mood, this.diary.tags);
            newDiaries.unshift(newDiary);
        }
        AppStorage.setOrCreate<DiaryEntry[]>('diaries', newDiaries);
        prompt.showToast({
            message: this.mode === 'add' ? '日记保存成功' : '日记更新成功',
            duration: 2000
        });
        router.back();
    }
    // 添加标签
    addTag() {
        const tag: string = this.newTag.trim();
        if (tag && !this.diary.tags.includes(tag)) {
            const newTags: string[] = [...this.diary.tags, tag];
            this.diary.tags = newTags;
            this.newTag = '';
            this.showTagInput = false;
        }
    }
    // 删除标签
    removeTag(index: number) {
        const newTags: string[] = [...this.diary.tags];
        newTags.splice(index, 1);
        this.diary.tags = newTags;
    }
    // 删除日记
    deleteDiary() {
        const newDiaries: DiaryEntry[] = this.diaries.filter((d: DiaryEntry) => d.id !== this.diary.id);
        AppStorage.setOrCreate<DiaryEntry[]>('diaries', newDiaries);
        prompt.showToast({ message: '日记已删除', duration: 2000 });
        router.back();
    }
    // 心情选择按钮的构建器
    buildMoodButtons(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 使用Flex容器实现换行
            Flex.create({ wrap: FlexWrap.Wrap });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const mood = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Button.createWithLabel(mood.label);
                    Button.padding({ left: 15, right: 15 });
                    Button.backgroundColor(this.diary.mood === mood.value ? '#007DFF' : '#EEEEEE');
                    Button.fontColor(this.diary.mood === mood.value ? Color.White : '#000000');
                    Button.borderRadius(20);
                    Button.margin({ right: 10, bottom: 10 });
                    Button.onClick(() => {
                        this.diary.mood = mood.value;
                    });
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(elmtId, this.moods, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        // 使用Flex容器实现换行
        Flex.pop();
    }
    // 标签列表的构建器
    buildTagList(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 使用Flex容器实现换行
            Flex.create({ wrap: FlexWrap.Wrap });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const tag = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.padding({ left: 10, right: 10, top: 5, bottom: 5 });
                    Row.backgroundColor('#E8F4FD');
                    Row.borderRadius(12);
                    Row.margin({ right: 8, bottom: 8 });
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(tag);
                    Text.fontSize(12);
                    Text.fontColor('#007DFF');
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('×');
                    Text.fontSize(12);
                    Text.fontColor('#007DFF');
                    Text.margin({ left: 4 });
                    Text.onClick(() => {
                        this.removeTag(index);
                    });
                }, Text);
                Text.pop();
                Row.pop();
            };
            this.forEachUpdateFunction(elmtId, this.diary.tags, forEachItemGenFunction, undefined, true, false);
        }, ForEach);
        ForEach.pop();
        // 使用Flex容器实现换行
        Flex.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部操作栏
            Row.create();
            // 顶部操作栏
            Row.width('100%');
            // 顶部操作栏
            Row.height(60);
            // 顶部操作栏
            Row.padding({ left: 16, right: 16 });
            // 顶部操作栏
            Row.backgroundColor('#FFFFFF');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.fontSize(16);
            Button.fontColor('#007DFF');
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => {
                router.back();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.mode === 'add' ? '写日记' : '编辑日记');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('保存');
            Button.fontSize(16);
            Button.fontColor('#007DFF');
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => {
                this.saveDiary();
            });
        }, Button);
        Button.pop();
        // 顶部操作栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 编辑区域
            Scroll.create();
            // 编辑区域
            Scroll.layoutWeight(1);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.padding(20);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题输入
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('标题');
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入日记标题', text: this.diary.title });
            TextInput.width('100%');
            TextInput.height(50);
            TextInput.backgroundColor(Color.White);
            TextInput.border({ width: 1, color: '#DDDDDD' });
            TextInput.borderRadius(8);
            TextInput.padding({ left: 10, right: 10 });
            TextInput.onChange((value: string) => {
                this.diary.title = value;
            });
        }, TextInput);
        // 标题输入
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 心情选择
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('心情');
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        // 使用构建器创建心情按钮
        this.buildMoodButtons.bind(this)();
        // 心情选择
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标签管理
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('标签');
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.showTagInput ? '取消' : '+ 添加标签');
            Button.fontSize(12);
            Button.backgroundColor(Color.Transparent);
            Button.fontColor('#007DFF');
            Button.onClick(() => {
                this.showTagInput = !this.showTagInput;
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 标签列表 - 需要根据条件设置底部margin
            if (this.diary.tags.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 使用构建器创建标签列表，并在Builder内部设置margin
                        Flex.create({ wrap: FlexWrap.Wrap });
                        // 使用构建器创建标签列表，并在Builder内部设置margin
                        Flex.margin({ bottom: this.showTagInput ? 10 : 0 });
                    }, Flex);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const tag = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.padding({ left: 10, right: 10, top: 5, bottom: 5 });
                                Row.backgroundColor('#E8F4FD');
                                Row.borderRadius(12);
                                Row.margin({ right: 8, bottom: 8 });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(tag);
                                Text.fontSize(12);
                                Text.fontColor('#007DFF');
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('×');
                                Text.fontSize(12);
                                Text.fontColor('#007DFF');
                                Text.margin({ left: 4 });
                                Text.onClick(() => {
                                    this.removeTag(index);
                                });
                            }, Text);
                            Text.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.diary.tags, forEachItemGenFunction, undefined, true, false);
                    }, ForEach);
                    ForEach.pop();
                    // 使用构建器创建标签列表，并在Builder内部设置margin
                    Flex.pop();
                });
            }
            // 标签输入框
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 标签输入框
            if (this.showTagInput) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 10 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: '输入新标签', text: this.newTag });
                        TextInput.layoutWeight(1);
                        TextInput.height(40);
                        TextInput.backgroundColor(Color.White);
                        TextInput.border({ width: 1, color: '#DDDDDD' });
                        TextInput.borderRadius(8);
                        TextInput.padding({ left: 10, right: 10 });
                        TextInput.onChange((value: string) => {
                            this.newTag = value;
                        });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('添加');
                        Button.height(40);
                        Button.padding({ left: 15, right: 15 });
                        Button.backgroundColor('#007DFF');
                        Button.fontColor(Color.White);
                        Button.borderRadius(8);
                        Button.onClick(() => {
                            this.addTag();
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        // 标签管理
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 内容输入
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('内容');
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ placeholder: '写下今天的心情和故事...', text: this.diary.content });
            TextArea.width('100%');
            TextArea.height(300);
            TextArea.backgroundColor(Color.White);
            TextArea.border({ width: 1, color: '#DDDDDD' });
            TextArea.borderRadius(8);
            TextArea.padding({ left: 10, right: 10, top: 10, bottom: 10 });
            TextArea.onChange((value: string) => {
                this.diary.content = value;
            });
        }, TextArea);
        // 内容输入
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 删除按钮（仅编辑模式）
            if (this.mode === 'edit') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('删除日记');
                        Button.width('100%');
                        Button.height(50);
                        Button.backgroundColor('#FF3B30');
                        Button.fontColor(Color.White);
                        Button.borderRadius(8);
                        Button.onClick(() => {
                            this.deleteDiary();
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
        Column.pop();
        // 编辑区域
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "DiaryEdit";
    }
}
registerNamedRoute(() => new DiaryEdit(undefined, {}), "", { bundleName: "com.example.dairy", moduleName: "entry", pagePath: "pages/DiaryEdit", pageFullPath: "entry/src/main/ets/pages/DiaryEdit", integratedHsp: "false" });
