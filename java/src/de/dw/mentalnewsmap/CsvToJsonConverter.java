package de.dw.mentalnewsmap;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import au.com.bytecode.opencsv.CSVReader;

/**
 * Converter that reads csv-files and outputs json.
 * 
 * @author hannes
 */
public class CsvToJsonConverter {

	private File csvInputFile;	
	
	public static final String CSV_FILENAME = "../data/Scoopcamp Hackathon Data 2014 - DW Artikel.csv";
	public static final String JSON_FILENAME = "../data/Scoopcamp Hackathon Data 2014 - DW Artikel.json";
	
	public static final char CSV_SEPARATOR = ',';
	public static final char CSV_QUOTE = '"';
	
	public static CsvToJsonConverter from(String csvFilename) {
		CsvToJsonConverter converter = new CsvToJsonConverter(csvFilename);
		return converter;
	}
	
	private CsvToJsonConverter(String csvFilename) {
		this.csvInputFile = new File(csvFilename);
	}
	
	public void to(String jsonFilename) throws IOException {
		// adapted example code from
		// http://howtodoinjava.com/2013/05/27/parse-csv-files-in-java/
		CSVReader reader = null;
		FileWriter jsonFileWriter = null;
		try {
            reader = new CSVReader(new FileReader(this.csvInputFile), CSV_SEPARATOR, CSV_QUOTE);
            // skip first line (column headers)
            String [] line = reader.readNext();
            List<ArticleData> articles = new ArrayList<>();
            // read all lines:
            while ((line = reader.readNext()) != null) {
            	try {
					ArticleData a = stringArrayToArticleData(line);
					articles.add(a);
				} catch (ParseException e) {
					System.out.println("Failed to parse csv line at offset " + e.getErrorOffset() + ": " + e.getMessage());
				}
            }
            
            jsonFileWriter = new FileWriter(jsonFilename);
			ObjectMapper om = new ObjectMapper();
			// enable pretty-printing of generated json:
			om.enable(SerializationFeature.INDENT_OUTPUT);
			om.writeValue(jsonFileWriter, articles);
        } finally {
            if (reader != null) {
            	reader.close();
            }
            if (jsonFileWriter != null) {
            	jsonFileWriter.close();
            }
        }
	}
	
	private final DateFormat pubDateFormat = new SimpleDateFormat("dd.MM.yyyy");
	
	private ArticleData stringArrayToArticleData(String[] line) throws ParseException {
		try {
			ArticleData articleData = new ArticleData();
		
			articleData.pubDate = pubDateFormat.parse(line[0]);
			articleData.articleTitle = line[1];
			articleData.teaser = line[2];
			articleData.articleUrl = line[3];
			articleData.imageUrl = line[4];
			articleData.kategorie = line[5];
			articleData.region = line[6];
			articleData.latitude = Float.valueOf(line[7]);
			articleData.longitude = Float.valueOf(line[8]);

			return articleData;
		} catch (NumberFormatException e) {
			throw new ParseException("Invalid number format " + e.getMessage(), 1);
		}
	}
	
	/**
	 * Main method: instantiate the converter and run it for the provided filenames:
	 * @param args
	 */
	public static void main(String[] args) {
		try {
			CsvToJsonConverter converter = CsvToJsonConverter.from(CSV_FILENAME);
			converter.to(JSON_FILENAME);
		} catch (IOException e) {
			System.out.println("Conversion failed: " + e.getMessage());
		}
	}

}
