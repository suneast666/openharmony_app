import { router } from '@kit.ArkUI';

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

// 使用 AppStorage 进行数据存储
@Entry
@Component
struct Index {
  // 使用 AppStorage 存储日记数据
  @StorageLink('diaries') diaries: DiaryEntry[] = [];
  @StorageLink('searchText') searchText: string = '';
  @State showSearch: boolean = false;

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
  @Builder
  moodIcon(mood: string) {
    if (mood === 'happy') {
      Text('😊')
        .fontSize(24)
        .width(30)
        .height(30)
        .textAlign(TextAlign.Center);
    } else if (mood === 'sad') {
      Text('😢')
        .fontSize(24)
        .width(30)
        .height(30)
        .textAlign(TextAlign.Center);
    } else if (mood === 'excited') {
      Text('😃')
        .fontSize(24)
        .width(30)
        .height(30)
        .textAlign(TextAlign.Center);
    } else if (mood === 'angry') {
      Text('😠')
        .fontSize(24)
        .width(30)
        .height(30)
        .textAlign(TextAlign.Center);
    } else {
      Text('😐')
        .fontSize(24)
        .width(30)
        .height(30)
        .textAlign(TextAlign.Center);
    }
  }

  build() {
    Column() {
      // 顶部标题栏
      Row() {
        Text('我的日记本')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .margin({ left: 16 })
          .fontColor('#000000')

        Blank()

        // 搜索按钮
        Button(this.showSearch ? '取消' : '搜索')
          .margin({ right: 16 })
          .fontSize(14)
          .backgroundColor(Color.Transparent)
          .fontColor('#007DFF')
          .onClick(() => {
            this.showSearch = !this.showSearch;
            if (!this.showSearch) {
              this.searchText = '';
            }
          })

        // 添加按钮
        Button('+')
          .margin({ right: 16 })
          .fontSize(20)
          .width(40)
          .height(40)
          .borderRadius(20)
          .backgroundColor('#007DFF')
          .fontColor(Color.White)
          .onClick(() => {
            router.pushUrl({
              url: 'pages/DiaryEdit',
              params: { mode: 'add' }
            });
          })
      }
      .width('100%')
      .height(60)
      .backgroundColor('#FFFFFF')
      .shadow({ radius: 4, color: '#DDDDDD' })

      // 搜索栏
      if (this.showSearch) {
        TextInput({ placeholder: '搜索日记标题或内容...', text: this.searchText })
          .width('90%')
          .height(40)
          .margin({ top: 10, bottom: 10 })
          .backgroundColor(Color.White)
          .border({ width: 1, color: '#DDDDDD' })
          .borderRadius(8)
          .padding({ left: 10, right: 10 })
          .onChange((value: string) => {
            this.searchText = value;
          })
      }

      // 日记列表 - 使用计算属性而不是本地变量
      // 获取过滤后的日记列表
      if (this.getFilteredDiaries().length > 0) {
        List({ space: 10 }) {
          ForEach(this.getFilteredDiaries(), (diary: DiaryEntry) => {
            ListItem() {
              Row() {
                // 心情图标
                Column() {
                  this.moodIcon(diary.mood)
                  Text(diary.time)
                    .fontSize(12)
                    .fontColor('#666666')
                    .margin({ top: 4 })
                }
                .margin({ right: 15 })
                .alignItems(HorizontalAlign.Center)

                // 日记内容摘要
                Column({ space: 4 }) {
                  Row() {
                    Text(diary.title || '无标题')
                      .fontSize(16)
                      .fontWeight(FontWeight.Medium)
                      .maxLines(1)
                      .textOverflow({ overflow: TextOverflow.Ellipsis })

                    Blank()

                    // 标签
                    if (diary.tags.length > 0) {
                      Row({ space: 4 }) {
                        ForEach(diary.tags.slice(0, 2), (tag: string) => {
                          Text(tag)
                            .fontSize(10)
                            .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                            .backgroundColor('#E8F4FD')
                            .borderRadius(10)
                            .fontColor('#007DFF')
                        })
                      }
                    }
                  }
                  .width('100%')

                  Text(diary.content.length > 100 ?
                    diary.content.substring(0, 100) + '...' : diary.content)
                    .fontSize(14)
                    .fontColor('#666666')
                    .maxLines(2)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })

                  Text(diary.date)
                    .fontSize(12)
                    .fontColor('#999999')
                    .margin({ top: 4 })
                }
                .layoutWeight(1)
              }
              .padding(15)
              .backgroundColor('#FFFFFF')
              .borderRadius(12)
              .shadow({ radius: 3, color: '#EEEEEE' })
            }
            .onClick(() => {
              router.pushUrl({
                url: 'pages/DiaryEdit',
                params: {
                  mode: 'edit',
                  diaryId: diary.id
                }
              });
            })
          })
        }
        .layoutWeight(1)
        .margin({ top: 10 })
        .width('100%')
        .height('100%')
      } else {
        // 空状态
        Column() {
          Text('📝')
            .fontSize(60)
            .margin({ bottom: 20 })

          Text(this.searchText ? '没有找到相关日记' : '还没有日记，开始记录吧！')
            .fontSize(16)
            .fontColor('#666666')

          if (!this.searchText) {
            Button('写第一篇日记')
              .margin({ top: 20 })
              .backgroundColor('#007DFF')
              .fontColor(Color.White)
              .onClick(() => {
                router.pushUrl({
                  url: 'pages/DiaryEdit',
                  params: { mode: 'add' }
                });
              })
          }
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}