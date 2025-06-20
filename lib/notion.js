import { Client } from '@notion/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function getOEMDatabase() {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [
        {
          property: '일자',
          direction: 'descending',
        },
      ],
    });
    
    return response.results.map(page => ({
      id: page.id,
      // 업무 일지 데이터베이스 구조에 맞게 수정
      todo: page.properties.TODO?.title?.[0]?.plain_text || '',
      workType: page.properties['업무 유형']?.select?.name || '',
      team: page.properties.TEAM?.select?.name || '',
      date: page.properties['일자']?.date?.start || '',
      timeSlot: page.properties['시간대']?.select?.name || '',
      progressTime: page.properties['진행 시간']?.select?.name || '',
      checked: page.properties.CHECK?.checkbox || false,
      notes: page.properties['비고']?.rich_text?.[0]?.plain_text || '',
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
    }));
  } catch (error) {
    console.error('Notion API 오류:', error);
    throw error;
  }
}

export async function createWorkItem(data) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        TODO: {
          title: [
            {
              text: {
                content: data.todo,
              },
            },
          ],
        },
        '업무 유형': {
          select: {
            name: data.workType,
          },
        },
        TEAM: {
          select: {
            name: data.team,
          },
        },
        '일자': {
          date: {
            start: data.date,
          },
        },
        '시간대': {
          select: {
            name: data.timeSlot,
          },
        },
        '진행 시간': {
          select: {
            name: data.progressTime,
          },
        },
        CHECK: {
          checkbox: data.checked,
        },
        '비고': {
          rich_text: [
            {
              text: {
                content: data.notes,
              },
            },
          ],
        },
      },
    });
    
    return response;
  } catch (error) {
    console.error('Notion 업무 아이템 생성 오류:', error);
    throw error;
  }
}
