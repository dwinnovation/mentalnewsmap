package de.dw.mentalnewsmap;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.ALWAYS)
public class ArticleData {

	@JsonFormat(pattern = "yyyy-MM-dd")
	public Date pubDate;
	public String articleTitle;
	public String teaser;
	public String articleUrl;
	public String imageUrl;
	public String kategorie;
	public String region;
	public float latitude;
	public float longitude;
	
}
