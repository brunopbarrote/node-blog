<template>

    <li class="entry">
        <div class="entry-container">
            <div class="entry-screenshot">
                <img class="entry-screenshot-img" v-bind:src="item.img_url"/>
            </div>
            <div class="entry-info">

                <div class="entry-title">
                    <router-link :to="'/post/' + item._id " class="entry-link">
                        {{ item.title}}
                    </router-link>
                </div>
                <div class="entry-tags tags">
                    <div style="color:#d9534f;" class="tag no-pointer" v-if="item.is_recommend" >推荐</div>                    
                    <div class="tag no-pointer">{{ item.from == 1 ? '原创' : '转载' }}</div>
                    <div class="tag clean no-pointer">{{ parseTime(item.create_at,"y年m月d日") }}</div>
                </div>
            </div>
            <div class="entry-meta">
                <div class="actions">
                    <div class="action">
                        <i class="fa fa-fire"></i><span>{{ item.visit_count }}</span>
                    </div>
                    <div class="action">
                        <i class="fa fa-comment-o"></i><span>{{ item.comment_count }}</span>
                    </div>
                </div>
            </div>
        </div>
    </li>

</template>

<script>
    export default {
        name: 'docs-item',
        props: ['item']
    }

</script>