import { router } from '@kit.ArkUI';
import prompt from '@ohos.promptAction';

// 日记数据模型
class DiaryEntry {
  id: string = '';
  title: string = '';
  content: string = '';
  date: string = '';
  time: string = '';
  mood: string = 'neutral';
  tags: string[] = [];

  constructor(
    title: string = '',
    content: string = '',
    mood: string = 'neutral',
    tags: string[] = []
  ) {
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

@Entry
@Component
struct DiaryEdit {
  @StorageLink('diaries') diaries: DiaryEntry[] = [];
  @State diary: DiaryEntry = new DiaryEntry();
  @State mode: string = 'add';
  @State newTag: string = '';
  @State showTagInput: boolean = false;

  // 心情选项 - 使用明确定义的类实例
  private moods: MoodOption[] = [
    new MoodOption('happy', '开心'),
    new MoodOption('sad', '难过'),
    new MoodOption('neutral', '平静'),
    new MoodOption('excited', '兴奋'),
    new MoodOption('angry', '生气')
  ];

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
    } else {
      // 添加新日记
      const newDiary = new DiaryEntry(
        this.diary.title,
        this.diary.content,
        this.diary.mood,
        this.diary.tags
      );
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
  @Builder
  buildMoodButtons() {
    // 使用Flex容器实现换行
    Flex({ wrap: FlexWrap.Wrap }) {
      ForEach(this.moods, (mood: MoodOption) => {
        Button(mood.label)
          .padding({ left: 15, right: 15 })
          .backgroundColor(this.diary.mood === mood.value ? '#007DFF' : '#EEEEEE')
          .fontColor(this.diary.mood === mood.value ? Color.White : '#000000')
          .borderRadius(20)
          .margin({ right: 10, bottom: 10 })
          .onClick(() => {
            this.diary.mood = mood.value;
          })
      })
    }
  }

  // 标签列表的构建器
  @Builder
  buildTagList() {
    // 使用Flex容器实现换行
    Flex({ wrap: FlexWrap.Wrap }) {
      ForEach(this.diary.tags, (tag: string, index: number) => {
        Row() {
          Text(tag)
            .fontSize(12)
            .fontColor('#007DFF')

          Text('×')
            .fontSize(12)
            .fontColor('#007DFF')
            .margin({ left: 4 })
            .onClick(() => {
              this.removeTag(index);
            })
        }
        .padding({ left: 10, right: 10, top: 5, bottom: 5 })
        .backgroundColor('#E8F4FD')
        .borderRadius(12)
        .margin({ right: 8, bottom: 8 })
      })
    }
  }

  build() {
    Column() {
      // 顶部操作栏
      Row() {
        Button('取消')
          .fontSize(16)
          .fontColor('#007DFF')
          .backgroundColor(Color.Transparent)
          .onClick(() => {
            router.back();
          })

        Text(this.mode === 'add' ? '写日记' : '编辑日记')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)

        Button('保存')
          .fontSize(16)
          .fontColor('#007DFF')
          .backgroundColor(Color.Transparent)
          .onClick(() => {
            this.saveDiary();
          })
      }
      .width('100%')
      .height(60)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')

      // 编辑区域
      Scroll() {
        Column({ space: 20 }) {
          // 标题输入
          Column({ space: 8 }) {
            Text('标题')
              .fontSize(14)
              .fontColor('#666666')

            TextInput({ placeholder: '请输入日记标题', text: this.diary.title })
              .width('100%')
              .height(50)
              .backgroundColor(Color.White)
              .border({ width: 1, color: '#DDDDDD' })
              .borderRadius(8)
              .padding({ left: 10, right: 10 })
              .onChange((value: string) => {
                this.diary.title = value;
              })
          }

          // 心情选择
          Column({ space: 8 }) {
            Text('心情')
              .fontSize(14)
              .fontColor('#666666')

            // 使用构建器创建心情按钮
            this.buildMoodButtons()
          }

          // 标签管理
          Column({ space: 8 }) {
            Row() {
              Text('标签')
                .fontSize(14)
                .fontColor('#666666')

              Blank()

              Button(this.showTagInput ? '取消' : '+ 添加标签')
                .fontSize(12)
                .backgroundColor(Color.Transparent)
                .fontColor('#007DFF')
                .onClick(() => {
                  this.showTagInput = !this.showTagInput;
                })
            }

            // 标签列表 - 需要根据条件设置底部margin
            if (this.diary.tags.length > 0) {
              // 使用构建器创建标签列表，并在Builder内部设置margin
              Flex({ wrap: FlexWrap.Wrap }) {
                ForEach(this.diary.tags, (tag: string, index: number) => {
                  Row() {
                    Text(tag)
                      .fontSize(12)
                      .fontColor('#007DFF')

                    Text('×')
                      .fontSize(12)
                      .fontColor('#007DFF')
                      .margin({ left: 4 })
                      .onClick(() => {
                        this.removeTag(index);
                      })
                  }
                  .padding({ left: 10, right: 10, top: 5, bottom: 5 })
                  .backgroundColor('#E8F4FD')
                  .borderRadius(12)
                  .margin({ right: 8, bottom: 8 })
                })
              }
              .margin({ bottom: this.showTagInput ? 10 : 0 })
            }

            // 标签输入框
            if (this.showTagInput) {
              Row({ space: 10 }) {
                TextInput({ placeholder: '输入新标签', text: this.newTag })
                  .layoutWeight(1)
                  .height(40)
                  .backgroundColor(Color.White)
                  .border({ width: 1, color: '#DDDDDD' })
                  .borderRadius(8)
                  .padding({ left: 10, right: 10 })
                  .onChange((value: string) => {
                    this.newTag = value;
                  })

                Button('添加')
                  .height(40)
                  .padding({ left: 15, right: 15 })
                  .backgroundColor('#007DFF')
                  .fontColor(Color.White)
                  .borderRadius(8)
                  .onClick(() => {
                    this.addTag();
                  })
              }
            }
          }

          // 内容输入
          Column({ space: 8 }) {
            Text('内容')
              .fontSize(14)
              .fontColor('#666666')

            TextArea({ placeholder: '写下今天的心情和故事...', text: this.diary.content })
              .width('100%')
              .height(300)
              .backgroundColor(Color.White)
              .border({ width: 1, color: '#DDDDDD' })
              .borderRadius(8)
              .padding({ left: 10, right: 10, top: 10, bottom: 10 })
              .onChange((value: string) => {
                this.diary.content = value;
              })
          }

          // 删除按钮（仅编辑模式）
          if (this.mode === 'edit') {
            Button('删除日记')
              .width('100%')
              .height(50)
              .backgroundColor('#FF3B30')
              .fontColor(Color.White)
              .borderRadius(8)
              .onClick(() => {
                this.deleteDiary();
              })
          }
        }
        .padding(20)
      }
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}