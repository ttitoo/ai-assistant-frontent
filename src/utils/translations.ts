
export default {
  answerFormats: {
    text: '文字',
    json: 'JSON'
  },
  sample_batch: {
    states: {
      unkown: '未知',
      to_be_confirmed: '待确认',
      calculating: '核算中',
      pending: '待批准',
      running: '运行中',
      suspended: '暂停',
      complete: '完成',
      rejected: '驳回'
    }
  },
  column_samples: {
    categories: {
      applications: '申请',
      answers: '问题',
    },
    applications: {
      batch_id: '批次',
      stage_key: '当前阶段'
    },
    operators: {
      equals: '等于',
      like: '包含关键字',
      notLike: '不包含关键字',
      ilike: '包含关键字(不区分大小写)',
      notILike: '不包含关键字(不区分大小写)',
      length_gt: '长度大于',
      length_lt: '长度小于',
    }
  }
}
